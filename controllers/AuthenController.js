const bcrypt = require('bcrypt');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const UserGoogle = require('../models/UserGoogle');
const queryString = require('query-string');
const UserGithub = require('../models/UserGithub');
const UserFacebook = require('../models/UserFacebook');
const useragent = require('useragent');
const WebServiceClient = require('@maxmind/geoip2-node').WebServiceClient;
const nodemailer = require('nodemailer');
const emailHTML = require('../utils/emailHTML');
const codeEmailHTML = require('../utils/codeEmailHTML');

const AuthenController = {
  setCookie: (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
      // Since localhost is not having https protocol,
      // secure cookies do not work correctly (in postman)
      //SameSite is set to "None" since client and server will be in different domains.
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'none',
      maxAge: 60000 * 60 * 24 * 365,
    });
  },

  genarateAccessToken: (user) => {
    return jwt.sign(
      {
        _id: user._id, // id is String
        admin: user.admin,
        verify: user.verify,
        provider: user.provider,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: '30s' },
    );
  },

  genarateEmailToken: (user) => {
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        provider: user.provider, // id is String
      },
      process.env.JWT_EMAIL_KEY,
      { expiresIn: '1d' },
    );
  },

  genarateRefreshToken: (user) => {
    return jwt.sign(
      {
        _id: user._id,
        admin: user.admin,
        verify: user.verify,
        provider: user.provider,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: '30d' },
    );
  },

  register: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      const newUser = new User({
        fullname: req.body.fullname,
        email: req.body.email,
        username: req.body.username,
        avatar: `https://api.multiavatar.com/${req.body.username}.svg?apikey=hQWHTvfLRKVqD0`,
        password: hashed,
      });

      const user = await newUser.save();
      const { username } = user._doc;

      res.status(200).json(username);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  loginSuccess: async (req, res, user) => {
    try {
      const accessToken = AuthenController.genarateAccessToken(user);
      const refreshToken = AuthenController.genarateRefreshToken(user);
      let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      if (process.env.GEOIP2_ACCOUNT_ID && process.env.GEOIP2_LICENSE_KEY) {
        if (clientIp === '::1') clientIp = '103.178.231.13';
        const geoip2 = new WebServiceClient(
          process.env.GEOIP2_ACCOUNT_ID,
          process.env.GEOIP2_LICENSE_KEY,
          {
            host: 'geolite.info',
          },
        );

        const cityRes = await geoip2.city(clientIp);

        const agent = useragent.parse(req.headers['user-agent']);

        const city = cityRes.city?.names?.en ? cityRes.city?.names?.en + ', ' : '';
        const country = cityRes.country?.names?.en;

        const newToken = new RefreshToken({
          userId: user._id,
          refreshToken: refreshToken,
          agent: agent.toAgent(),
          os: agent.os.toString(),
          device: agent.device.toString(),
          location: city + country,
          ip: clientIp,
        });

        await newToken.save();
      }

      const newToken = new RefreshToken({
        userId: user._id,
        refreshToken: refreshToken,
        agent: 'unknow',
        os: 'unknow',
        device: 'unknow',
        location: 'unknow',
        ip: clientIp,
      });

      await newToken.save();

      AuthenController.setCookie(res, refreshToken);

      return accessToken;
    } catch (err) {
      console.log(err);
      return false;
    }
  },

  loginLocal: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });

      if (!user)
        return res.status(400).json({
          error: true,
          key: 'username',
          mess: 'Username is not exist',
        });

      const match = await bcrypt.compare(req.body.password, user.password);

      if (match) {
        const accessToken = await AuthenController.loginSuccess(req, res, user);
        const { password, ...other } = user._doc;
        if (accessToken)
          return res.status(200).json({
            accessToken,
            ...other,
          });

        res.status(400).json({
          error: true,
          mess: 'Login Failed',
        });
      } else {
        res.status(400).json({
          error: true,
          key: 'password',
          mess: 'Incorrect password',
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  loginGoogle: async (req, res) => {
    try {
      let userGoogle = await UserGoogle.findOne({
        googleId: req.body.googleId,
      });

      if (!userGoogle) {
        const newUserGoogle = new UserGoogle({
          fullname: req.body.fullname,
          avatar: req.body.avatar,
          googleId: req.body.googleId,
          email: req.body.email,
        });

        userGoogle = await newUserGoogle.save();
      }

      const accessToken = await AuthenController.loginSuccess(req, res, userGoogle);
      if (accessToken)
        return res.status(200).json({
          ...userGoogle._doc,
          accessToken,
        });

      res.status(400).json({
        error: true,
        mess: 'Login Failed',
      });
    } catch (err) {
      res.status(500).json(err.toString());
    }
  },

  loginGithub: async (req, res) => {
    try {
      let userGithub = await UserGithub.findOne({
        githubId: req.body.githubId,
      });

      if (!userGithub) {
        const newUserGoogle = new UserGithub({
          fullname: req.body.fullname,
          username: req.body.username,
          avatar: req.body.avatar,
          githubId: req.body.githubId,
          email: req.body.email,
        });

        userGithub = await newUserGoogle.save();
      }

      const accessToken = await AuthenController.loginSuccess(req, res, userGithub);

      if (accessToken)
        return res.status(200).json({
          ...userGithub._doc,
          accessToken,
        });

      res.status(400).json({
        error: true,
        mess: 'Login Failed',
      });
    } catch (err) {
      res.status(500).json(err.toString());
    }
  },

  loginFacebook: async (req, res) => {
    try {
      let userFacebook = await UserFacebook.findOne({
        facebookId: req.body.facebookId,
      });

      if (!userFacebook) {
        const newUserGoogle = new UserFacebook({
          fullname: req.body.fullname,
          avatar: req.body.avatar,
          facebookId: req.body.facebookId,
          email: req.body.email,
        });

        userFacebook = await newUserGoogle.save();
      }

      const accessToken = await AuthenController.loginSuccess(req, res, userFacebook);

      if (accessToken)
        return res.status(200).json({
          ...userFacebook._doc,
          accessToken,
        });

      res.status(400).json({
        error: true,
        mess: 'Login Failed',
      });

      accessToken;
    } catch (err) {
      res.status(500).json(err.toString());
    }
  },

  requestRefreshToken: async (req, res) => {
    try {
      const refreshTokenRequest = req.cookies.refreshToken;

      if (!refreshTokenRequest)
        return res.status(401).json({ error: true, mess: "You're not authenticated" });

      const match = await RefreshToken.findOne({
        refreshToken: refreshTokenRequest,
      });

      if (!match) return res.status(401).json({ error: true, mess: "You're not authenticated" });

      jwt.verify(refreshTokenRequest, process.env.JWT_ACCESS_KEY, async (err, userToken) => {
        if (err) {
          await RefreshToken.deleteOne({ refreshToken: refreshTokenRequest });
          return res.status(403).json({ error: true, mess: 'Refresh token is not valid' });
        }

        let user = null;

        switch (userToken.provider) {
          case 'github':
            user = await UserGithub.findOne({ _id: userToken._id });
            break;
          case 'google':
            user = await UserGoogle.findOne({ _id: userToken._id });
            break;
          case 'facebook':
            user = await UserFacebook.findOne({ _id: userToken._id });
            break;
          default:
            user = await User.findOne({ _id: userToken._id });
        }

        if (!user) return res.status(401).json({ error: true, mess: "You're not authenticated" });

        const newAccessToken = AuthenController.genarateAccessToken(user);
        const newRefreshToken = AuthenController.genarateRefreshToken(user);

        await RefreshToken.updateOne(
          { refreshToken: refreshTokenRequest },
          {
            refreshToken: newRefreshToken,
          },
        );

        AuthenController.setCookie(res, newRefreshToken);

        res.status(200).json({ accessToken: newAccessToken });
      });
    } catch (err) {
      res.status(500).json(err.toString());
    }
  },

  logout: async (req, res) => {
    try {
      const refreshTokenRequest = req.cookies.refreshToken;
      if (!refreshTokenRequest)
        return res.status(401).json({ error: true, mess: 'Refresh token is not valid' });

      await RefreshToken.deleteOne({ refreshToken: refreshTokenRequest });

      AuthenController.setCookie(res, '');
      res.clearCookie('refreshToken');

      res.status(200).json('Logout Successfully');
    } catch (err) {
      res.status(400).json({ error: true, mess: 'Logout Failed' });
    }
  },

  githubCallback: async (req, res) => {
    try {
      const code = req.query.code;
      const payload = {
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
      };

      const accessTokenRes = await axios.post(
        'https://github.com/login/oauth/access_token?' + queryString.stringify(payload),
        {},
        {
          headers: {
            accept: 'application/json',
          },
        },
      );

      const { access_token } = accessTokenRes.data;
      const userGithubRes = await axios.get('https://api.github.com/user', {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + access_token,
        },
      });

      const userGithub = userGithubRes.data;

      const user = {
        username: userGithub.login,
        githubId: userGithub.id,
        // avatar: userGithub.avatar_url,
        email: userGithub.email || '',
      };

      res.redirect(
        process.env.CLIENT_URL +
          '/load?avatar=' +
          userGithub.avatar_url +
          '&' +
          queryString.stringify(user),
      );
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  },

  sendVerificationEmail: async (req, res) => {
    // console.log('req: ', req.user);
    try {
      let user = {};

      switch (req.user.provider) {
        case 'github':
          user = await UserGithub.findOne({ _id: req.user._id });
          break;
        case 'google':
          user = await UserGoogle.findOne({ _id: req.user._id });
          break;
        case 'facebook':
          user = await UserFacebook.findOne({ _id: req.user._id });
          break;
        default:
          user = await User.findOne({ _id: req.user._id });
      }

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'popushop.ecommerce@gmail.com',
          pass: process.env.GMAIL_KEY,
        },
      });

      const tokenEmail = AuthenController.genarateEmailToken(user);

      // send mail with defined transport object
      transporter.sendMail({
        from: 'popushop.ecommerce@gmail.com', // sender address
        to: user.email, // list of receivers
        subject: 'Verification Email Address', // Subject line
        text: '', // plain text body
        html: emailHTML(process.env.SERVER_URL + '/auth/confirmation/emailVerify/' + tokenEmail), // html body
      });
      res.status(200).json('Send verification email successfully');
    } catch (err) {
      res.status(500).json(err.toString());
      console.log('err: ', err);
    }
  },

  confirmVerificationEmail: async (req, res) => {
    try {
      const tokenEmail = req.params.tokenEmail;

      if (!tokenEmail) res.status(401).send('Token does not exist');

      let userCurrent = {};

      jwt.verify(tokenEmail, process.env.JWT_EMAIL_KEY, (err, user) => {
        if (err) {
          return res.status(401).send('Token is not valid');
        }
        userCurrent = user;
      });

      switch (userCurrent.provider) {
        case 'github':
          await UserGithub.updateOne({ _id: userCurrent._id }, { verify: true });
          break;
        case 'google':
          await UserGoogle.updateOne({ _id: userCurrent._id }, { verify: true });
          break;
        case 'facebook':
          await UserFacebook.updateOne({ _id: userCurrent._id }, { verify: true });
          break;
        default:
          await User.updateOne({ _id: userCurrent._id }, { verify: true });
      }

      res.redirect(process.env.CLIENT_URL + '/profile/account');
    } catch (err) {
      res.status(500).send(err.toString());
    }
  },

  sendCodeViaEmail: async (req, res) => {
    try {
      const email = req.body.email;

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'popushop.ecommerce@gmail.com',
          pass: process.env.GMAIL_KEY,
        },
      });

      const code = Math.round(Math.random() * (999999 - 100000) + 100000);

      // send mail with defined transport object
      transporter.sendMail({
        from: 'popushop.ecommerce@gmail.com', // sender address
        to: email, // list of receivers
        subject: `${code} is your Popushop account recovery code`, // Subject line
        text: '', // plain text body
        html: codeEmailHTML(code), // html body
      });

      await User.updateOne({ email: email }, { code: code });

      res.status(200).json('Send code via email successfully');
    } catch (err) {
      res.status(500).send(err.toString());
    }
  },

  confirmCodeViaEmail: async (req, res) => {
    try {
      const email = req.body.email;
      const code = req.body.code;

      const user = await User.findOne({ email: email });
      if (!user) return res.status(404).json('Account not found');

      if (user.code !== code)
        return res.status(400).json({ error: true, mess: 'Code is not valid' });

      res.status(200).json('Successfully verify code');
    } catch (err) {
      res.status(500).send(err.toString());
    }
  },

  changePasswordWithCodeVia: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) return res.status(400).json({ error: true, mess: 'Account not found' });

      if (user.code !== req.body.code)
        return res.status(400).json({ error: true, mess: 'Code is not valid' });

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);
      await User.updateOne(
        {
          email: req.body.email,
        },
        {
          password: hashed,
          $unset: { code: true },
        },
      );

      res.status(200).json('Successfully change new password');
    } catch (err) {
      res.status(500).send(err.toString());
    }
  },
};

module.exports = AuthenController;
