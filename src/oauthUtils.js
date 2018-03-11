const { CLIENT_ID, CLIENT_SECRET } = process.env;

function getOAuthHeader(accessToken) {
  return { Authorization: 'Bearer ' + accessToken };
}

function getBasicAuthHeader() {
  const authorizationHeader = new Buffer(
    CLIENT_ID + ':' + CLIENT_SECRET
  ).toString('base64');
  return { Authorization: `Basic ${authorizationHeader}` };
}

module.exports = {
  getOAuthHeader,
  getBasicAuthHeader,
};
