
import express from "express";
import { Configuration, DealsApi, OAuth2Configuration, DealFieldsApi } from "pipedrive/v1";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";

const app = express();

app.use(cookieParser());
app.use(cookieSession({
    name: "session",
    keys: ["key1"]
}));

const PORT = 3000;
let auth_token;


const oauth2 = new OAuth2Configuration({
    clientId: "5bb87ab8a8357090", // OAuth 2 Client ID
    clientSecret: "b744a4a3555c86b3188ba5565264a5ca44626fbc",  // OAuth 2 Client Secret
    redirectUri: 'https://aver.bube.zip/pipedrive/callback' // OAuth 2 Redirection endpoint or Callback Uri
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.get('/deal', async (req, res) => {
  try {
    // method will handle return null if token is not available in the session
    const token = oauth2.updateToken(req.session?.accessToken);

     if (!token) {
        const authUrl = oauth2.authorizationUrl;
        return res.redirect(authUrl);
    }


    const apiConfig = new Configuration({
        accessToken: oauth2.getAccessToken,
        basePath: oauth2.basePath,
    });

    // token is already set in the session
    // now make API calls as required
    // client will automatically refresh the token when it expires and call the token update callback
    const dealsApi = new DealsApi(apiConfig)
    dealsApi.addDeal
    const response = await dealsApi.getDeals();
    const { data: deals } = response;
    return res.send(deals);
  } catch (error){
      s.error(error)
      return res.status(500).send(error)
  }
});

app.post('/field', async (req,res) => {
    try {
        const apiConfig = new Configuration({
            accessToken: oauth2.getAccessToken,
            basePath: oauth2.basePath,
        });

        const dealsApi = new DealsApi(apiConfig)
        await dealsApi.updateDeal(1, {
            custom_fields: {
              'custom_field_123': 'High' // Используем KEY поля
            }
          });
        console.log(response)

        console.log('Custom field was added successfully!');
    }catch (error) {
        console.log('send field ERROR')
        console.error(error)
        return res.status(500).send(error)
    }
})

app.get('/callback', async (req, res) => {
    try {
        const authCode = req.query.code;
        const newAccessToken = await oauth2.authorize(authCode);

        req.session.accessToken = newAccessToken;
        auth_token = newAccessToken;
        console.log(auth_token)
        console.log('suc redirect')
        return res.redirect("/");
    }catch (error) {
        console.log('callback ERROR')
        console.error(error)
        return res.status(500).send(error)
    }
});
