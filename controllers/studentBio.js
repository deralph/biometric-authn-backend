const SimpleWebAuthnServer = require("@simplewebauthn/server");
const badRequest = require("../errors/badRequest");
const unauthorised = require("../errors/unauthorized");
const { generateRegistrationOptions, verifyRegistrationResponse } =
  SimpleWebAuthnServer;
const { generateAuthenticationOptions, verifyAuthenticationResponse } =
  SimpleWebAuthnServer;
const User = require("../model/studentBio");
const utils = require("../utils");
const base64url = require("base64url");
const classes = require("../model/classes");

// Human-readable title for your website
const rpName = "SimpleWebAuthn Example";
// A unique identifier for your website
const rpID = "localhost";
// The URL at which registrations and authentications should occur
const origin = `http://localhost:3000`;

const registerBio = async (req, res) => {
  console.log("in");
  // console.log(req.body);
  const { admissionId, email } = req.user;

  if (!req.body || !admissionId || !email) {
    throw new unauthorised("action requires admissionId and email");
  }
  // const user = await User.findOne({ email, admissionId });
  // if (user) throw new unauthorised("user already registered");
  const userAuthenticators = [];

  const newUser = {
    admissionId,
    email,
    registered: false,
    // userId: utils.randomBase64URLBuffer(),
    authenticators: [],
    attended: [],
  };
  const latestUser = await User.create(newUser);
  const latestUserIdString = latestUser._id.toString();

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

const verifyRegistrationOfBio = async (req, res) => {
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
    // registered: true,
  };
  console.log(newAuthenticator, verified);
  const email = req.session.email;
  const user = await User.findOneAndUpdate(
    { email },
    { authenticators: [newAuthenticator], registered: true },
    {
      new: true,
      runValidators: true,
    }
  );
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

const createAuthenticationOptionForAttendanceUsingBio = async (req, res) => {
  console.log("in login");
  const { admissionId, email } = req.user;
  console.log(req.user);
  const body = req.body;
  console.log(body);
  if (!admissionId || !email) {
    throw new unauthorised("action requires admissionId and email");
  }
  const user = await User.findOne({ email, admissionId });

  console.log(user);
  if (!user)
    throw new unauthorised(
      "an error ocured in which user was not detected, please try logging in again"
    );

  // (Pseudocode) Retrieve the logged-in user
  //   const user: UserModel = getUserFromDB(loggedInUserId);
  // (Pseudocode) Retrieve any of the user's previously-
  // registered authenticators
  //   const userAuthenticators: Authenticator[] = getUserAuthenticators(user);

  // const { credentialID, credentialPublicKey, counter } = user;

  // const userAuthenticators = [
  //   {
  //     credentialID,
  //     credentialPublicKey,
  //     counter,
  //   },
  // ];
  const userAuthenticators = user.authenticators;

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
  console.log(req.session.email);
  req.session.body = body;
  // req.session.save()
  res.status(200).json(options);
};

const verifyAttendance = async (req, res) => {
  console.log("verifying login");
  const { body } = req;
  const { admissionId, email: userEmail } = req.user;
  console.log(body);
  console.log(req.session);

  // (Pseudocode) Retrieve the logged-in user
  // const user: UserModel = getUserFromDB(loggedInUserId);
  const email = req.session.email;
  const sessionBody = req.session.body;
  // console.log(email);
  const user = await User.findOne({ admissionId, email });

  // (Pseudocode) Get `options.challenge` that was saved above
  const expectedChallenge = req.session.challenge;
  // (Pseudocode} Retrieve an authenticator from the DB that
  // should match the `id` in the returned credential
  console.log(user);

  const decode = base64url.decode(user.credentialID);
  console.log(decode);
  console.log(user.credentialID, body.id);
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
  // const user = await User.findOne({ admissionId, email });

  // const { credentialID, credentialPublicKey, counter } = user;

  // const userAuthenticators = [
  //   {
  //     credentialID,
  //     credentialPublicKey,
  //     counter,
  //   },
  // ];
  const answer = user.authenticators[0].credentialID === body.id;
  console.log(answer);
  const { course_code, class_code } = sessionBody;

  const Class = await classes.findOne({ course_code, class_code });

  if (!Class) throw new badRequest("invalid class code or course code");

  if (Class.closed)
    throw new badRequest("oops the attendance for this class is closed");

  const newAttendance = [...user.attended, Class];

  const studentAttendanceTaken = await User.findByIdAndUpdate(
    { admissionId, email },
    { attended: newAttendance },
    { new: true, runValidators: true }
  );
  if (!studentAttendanceTaken)
    throw new badRequest("error ocured while taking attendance");
  const result = utils.verifyAuthenticatorAssertionResponse(
    body,
    user.authenticators
  );
  console.log(result);
  res.status(200).json({ sucess: true, messasge: "attendance added", result });
};

const deleteUnregisteredStudent = async (req, res) => {
  const { admissionId, email } = req.user;
  const user = await User.findOne({ admissionId, email });
  if (!user) throw new badRequest("user was not created ");
  if (user.registered)
    throw new badRequest("user biometric was registered sucessfully");
  const deletedUser = await User.deleteOne({ admissionId, email });
  res.status(200).json({ message: "user deleted sucessfully", deletedUser });
};

module.exports = {
  registerBio,
  verifyRegistrationOfBio,
  createAuthenticationOptionForAttendanceUsingBio,
  verifyAttendance,
  deleteUnregisteredStudent,
};
