const SimpleWebAuthnServer = require("@simplewebauthn/server");
const badRequest = require("../errors/badRequest");
const unauthorised = require("../errors/unauthorized");
const { generateRegistrationOptions, verifyRegistrationResponse } =
  SimpleWebAuthnServer;
const { generateAuthenticationOptions, verifyAuthenticationResponse } =
  SimpleWebAuthnServer;
const User = require("../model/user");

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

  let options = generateRegistrationOptions({
    rpName,
    rpID,
    userID: latestUser._id,
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
  };
  console.log(newAuthenticator, verified);
const email = req.session.email
  const user = await User.findOneAndUpdate({email},newAuthenticator,{ new: true, runValidators: true })
  

  // (Pseudocode) Save the authenticator info so that we can
  // get it by user ID later
  //   saveNewUserAuthenticatorInDB(user, newAuthenticator);
  res.status(200).json({ verified });
};


// login user

const register = async (req, res) => {
  console.log("in");
  console.log(req.body);
  const { admissionId, email } = req.body;

  if (!req.body || !admissionId || !email) {
    throw new unauthorised("action requires admissionId and email");
  }
  const user = await User.findOne({ email, admissionId });

module.exports = { register, verifyRegistration };
