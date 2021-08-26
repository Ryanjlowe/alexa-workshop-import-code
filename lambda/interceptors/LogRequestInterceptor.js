/**
 * Request Interceptor to log the request sent by Alexa
 */
const LogRequestInterceptor = {
  process(handlerInput) {
    // Log Request
    console.log("==== REQUEST ======");
    console.log(JSON.stringify(handlerInput.requestEnvelope, null, 2));
  }
}

module.exports = LogRequestInterceptor
