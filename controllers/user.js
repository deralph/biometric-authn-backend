const SimpleWebAuthnServer = require("@simplewebauthn/server");
const badRequest = require("../errors/badRequest");
const unauthorised = require("../errors/unauthorized");
const { generateRegistrationOptions, verifyRegistrationResponse } =
  SimpleWebAuthnServer;
const { generateAuthenticationOptions, verifyAuthenticationResponse } =
  SimpleWebAuthnServer;
const User = require("../model/user");
const utils = require('../utils')

// Human-readable title for your website
const rpName = "SimpleWebAuthn Example";
// A unique identifier for your website
const rpID = "localhost";
// The URL at which registrations and authentications should occur
const origin = `http://localhost:3000`;

const register = async (req, res) => {
  console.log("in");
  console.log(req.body);
  const { admissionId, email } = req.body;

  if (!req.body || !admissionId || !email) {
    throw new unauthorised("action requires admissionId and email");
  }
  const user = await User.findOne({ email, admissionId });
  if (user) throw new unauthorised("user already registered");
  const userAuthenticators = [];

  const newUser = {
    admissionId,
    email,
    registered: false,
    // userId: utils.randomBase64URLBuffer(),
    authenticators: [],
  };
  const latestUser = await User.create(newUser);
  const latestUserIdString =latestUser._id.toString()

  let options = generateRegistrationOptions({
    rpName,
    rpID,
    userID: latestUserIdString,
    userName: latestUser.email,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: "indirect",
    // Prevent users from re-registering existing authenticators
    excludeCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credentialID,
      type: "public-key",
      // Optional
      transports: authenticator.transports,
    })),
  });
  console.log(options);
  const { challenge } = options;
  console.log(challenge);

  req.session.challenge = challenge;
  console.log(req.session.challenge);
  req.session.email = email;

  res.status(200).json(options);
};

const verifyRegistration = async (req, res) => {
  const { body } = req;
  console.log("in verification");
  console.log(req.session);

  if (
    !body ||
    !body.id ||
    !body.rawId ||
    !body.response ||
    !body.type ||
    body.type !== "public-key"
  ) {
    throw new unauthorised(
      "Response missing one or more of id/rawId/response/type fields, or type is not public-key!"
    );
  }
  // (Pseudocode) Retrieve the logged-in user
  // const user: UserModel = getUserFromDB(loggedInUserId);
  // (Pseudocode) Get `options.challenge` that was saved above
  const expectedChallenge = req.session.challenge;
  console.log(expectedChallenge);
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      credential: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
    console.log(verification);
  } catch (error) {
    console.error(error);
    //   return res.status(400).send({ error: error.message });
    throw new badRequest(error.message);
  }
  const { verified } = verification;
  console.log(verification);

  const { registrationInfo } = verification;
  const { credentialPublicKey, credentialID, counter } = registrationInfo;

  const newAuthenticator = {
    credentialID,
    credentialPublicKey,
    counter,
    registered: true,
  };
  console.log(newAuthenticator, verified);
  const email = req.session.email;
  const user = await User.findOneAndUpdate({ email }, newAuthenticator, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new unauthorised(
      "an issue ocurred with the user please try logging in again"
    );
  }

  // (Pseudocode) Save the authenticator info so that we can
  // get it by user ID later
  //   saveNewUserAuthenticatorInDB(user, newAuthenticator);
  res.status(200).json({ verified });
};

// login user

const login = async (req, res) => {
  console.log("in login");
  console.log(req.body);
  const { admissionId, email } = req.body;

  if (!req.body || !admissionId || !email) {
    throw new unauthorised("action requires admissionId and email");
  }
  const user = await User.findOne({ email, admissionId });

  console.log(user)

  // (Pseudocode) Retrieve the logged-in user
  //   const user: UserModel = getUserFromDB(loggedInUserId);
  // (Pseudocode) Retrieve any of the user's previously-
  // registered authenticators
  //   const userAuthenticators: Authenticator[] = getUserAuthenticators(user);

  const { credentialID, credentialPublicKey, counter } = user;

  const userAuthenticators = [
    {
      credentialID,
      credentialPublicKey,
      counter,
    },
  ];

  const options = generateAuthenticationOptions({
    // Require users to use a previously-registered authenticator
    allowCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credentialID,
      type: "public-key",
      // Optional
      transports: authenticator.transports,
    })),
    userVerification: "preferred",
  });

//  let getAssertion    = utils.generateServerGetAssertion(userAuthenticators)
//     getAssertion.status = 'ok'

//     req.session.challenge = getAssertion.challenge;
//     req.session.username  = email;
//     console.log('getting assertion')
// console.log(getAssertion)
//     res.json(getAssertion)
  
  // (Pseudocode) Remember this challenge for this user
  //   setUserCurrentChallenge(user, options.challenge);

  // console.log(options);
  req.session.challenge = options.challenge;
  console.log(req.session.challenge);
  req.session.email = email;
  console.log(req.session.email)
  // req.session.save()
  res.status(200).json(options);
};

const verifyLogin = async (req, res) => {
  console.log("verifying login");
  const { body } = req;
  console.log(body);
  console.log(req.session);

  // (Pseudocode) Retrieve the logged-in user
  // const user: UserModel = getUserFromDB(loggedInUserId);
  const email = req.session.email;
  // console.log(email);
  const user = await User.findOne({ email });

  // (Pseudocode) Get `options.challenge` that was saved above
  const expectedChallenge = req.session.challenge;
  // (Pseudocode} Retrieve an authenticator from the DB that
  // should match the `id` in the returned credential
  console.log(user);
  console.log(user.credentialID,body.id)
  // const authenticator = user._id.toString() === body.id;
  // console.log(authenticator);

  // if (!authenticator) {
  //   throw new Error(
  //     `Could not find authenticator ${body.id} for user ${user.id}`
  //   );
  // }

  // let verification;
  // try {
  //   verification = await verifyAuthenticationResponse({
  //     credential: body,
  //     expectedChallenge,
  //     expectedOrigin: origin,
  //     expectedRPID: rpID,
  //     authenticator:true,
  //   });
  //   const { verified } = verification;
  //   console.log(verification)

  //   const { authenticationInfo } = verification;
  //   const { newCounter } = authenticationInfo;

  //   if (verified) {
  //     const user = await User.findOneAndUpdate(
  //       { email },
  //       { counter: newCounter },
  //       {
  //         new: true,
  //         runValidators: true,
  //       }
  //     );
  //   }

  //   // saveUpdatedAuthenticatorCounter(authenticator, newCounter);

  //   res.status(200).json(verified);
  // } catch (error) {
  //   console.error(error);
  //   return res.status(400).send({ error: error.message });
  // }
  // const user = await User.findOne({ email });

  const { credentialID, credentialPublicKey, counter } = user;

  const userAuthenticators = [
    {
      credentialID,
      credentialPublicKey,
      counter,
    },
  ];
  const answer = userAuthenticators.credentialID===body.id
  console.log(answer)
  res.json({msg:'pending'})
// const  result = utils.verifyAuthenticatorAssertionResponse(body, userAuthenticators);
};

module.exports = { register, verifyRegistration, login, verifyLogin };
