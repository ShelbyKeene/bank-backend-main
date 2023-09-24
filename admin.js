const admin = require('firebase-admin');

const type = "service_account";
const project_id = "test-8a648";
const private_key_id = "713c85d9c2d780c16aa7e62a9468906992ba0671";
const private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC4Ax3mC3bDurvF\nEdS/OEF6BZdTg9H8yuyDaIbxbnH3+udBYW0yeDotp21VIoSsARKcAPjkSwMPxhk+\nbHuYhMg/dWw/xG40KGb+A1f14fthQlnwXQnO5hklOYbdf8yoFUGWWHZ2rP3/Ds2e\n8k9zDBvkOqUH7bygL2Ui2/PWuLVjCBNPv0H7sc7HiI9OFQ0HpTK6rp/EIivNtVBV\nqd7wpa/iBlt1kkzhWTf5+c1ngF5/7SdAeqy7gChqGsWlVdyUttt8Ap4onR3nr5VL\nBzqm9UgKiv0dDgXRi+gPylSVUuXEOz+k3Y1bwuNvDFJkR7gAbbFHrTVsY6ugAPvj\n16e6HikVAgMBAAECggEAArPVBBRmBaDf8hh9ceN/Hq4nV0wn0NkgGRv3Y2NWXCh8\nrfqi0mtum04KroXnwejwH4dqIFwzqs8jfsW0GPzWPgxY7yTQ44Y2YQOmjo9nlDmX\nvY54PuglNWU/ZFBkrpFFWdJpxvtqbY0Hmw5++TcTz8nGs7ObohSgHR9y2NP0ogQt\ndUKWQ7hZz6rIXfCstNS9v1X7AKQ8UCaB+W4KA+RR8F4GSxENknVqqEDR00u2MS/9\nw8kpYNMaE7N901QStzu2DQMriEPk9sYciUV+0Wzl3u7jfo3Sawnm0HfEpfs7xQdu\nn08krf+DifGkRspNKFgtfSv9eEFPP2nJAJN/LRKZcQKBgQDm4GaXGiki1qn123fQ\naT8+pgHsoswR90YkMXzVbnT82pqZCmJaU8H4YajKSBnKjVcJmrqX8D2Ao37MJgDg\nZtHBr5D+tK+weEVJDOzf35mIBGhfomyNetU0V0yMX6iZt55gtV9/8qGszFetkE5Q\nDIuyFVjf/hgMi92Qm/tJrRV0CQKBgQDMCTNKplLvwm6dgtPbATi3jRmouYsKtRop\nGWaAjN99QJ10MrVt9kEszHQZkRhAdWWWl4pPk/FtLlIo43+Hd9rrD4sk/TCGZFt0\nK3nyzdE7WQzTFopWds++IN08X7h1vMRT5mDuYxgHCZbt2yKDTyfb/rxsxXXpF9pu\ngmAXJn6HrQKBgFTloXPgz82ayCa7DETb3sDHxJ9igc39cpJujCvjkStFq2GpWt9C\nO2p9ZtbzSmCcNqw2dHTYh5UdCcxCEUJzLKCfUZ8HjC9FGp0xHo14KHnGvSalkGs6\nBtpXW7OmnVXhGmEPcM2Yx/DFt1wAW3u+EURr6yF6yxcZ+2Boqy+9cM0ZAoGAMIR/\njeC/GARECXBysEE6G2uSDm0QgxtNfThtB2R4QHB9AISOX/eOx/hWIz49ZhaEcarX\nWNT1M+Ev6EkwqiX2CK9JhyItx8dVd+petT374wDp68gQXT8jZzKpaRHZ6yVYChte\nMVGfBQ1itmzFaDQKZmXMqJDL2QGzD1QxRVACBoECgYBUWj+Z5K3E34kwzQ6t3Gje\ne3Ju3xgD+F9+DikSn9giYpXO4ORZs8Qpna1FxWbvKrsKXYKevfWeBVylFlSyl29t\nV+EAraiHoFAyWy14lGFirb2sWuS1T0yrE369RGZHjCiKnnE1qfSr8VmsrjWGlcpy\nycz9cwR0ABuCcXxFpOwQbQ==\n-----END PRIVATE KEY-----\n";
const client_email = "firebase-adminsdk-2gr4x@test-8a648.iam.gserviceaccount.com";
const client_id = "109338500711631220703";
const auth_uri = "https://accounts.google.com/o/oauth2/auth";
const token_uri = "https://oauth2.googleapis.com/token";
const auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs";
const client_x509_cert_url = "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-2gr4x%40test-8a648.iam.gserviceaccount.com";
const universe_domain = "googleapis.com"


// credential grants access to Firebase services
admin.initializeApp({
  credential: admin.credential.cert({
      type,
      project_id,
      private_key_id,
      private_key:
        private_key.replace(/\\n/g,'\n'),
      client_email,
      client_id,
      auth_uri,
      token_uri,
      auth_provider_x509_cert_url,
      client_x509_cert_url,
      universe_domain
  }),
});

module.exports = admin;