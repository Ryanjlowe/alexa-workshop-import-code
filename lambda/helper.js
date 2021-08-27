
const getResolvedWordsAC = function(handlerInput, slot) {
    if (handlerInput.requestEnvelope &&
      handlerInput.requestEnvelope.request &&
      handlerInput.requestEnvelope.request.apiRequest &&
      handlerInput.requestEnvelope.request.apiRequest.slots &&
      handlerInput.requestEnvelope.request.apiRequest.slots[slot] &&
      handlerInput.requestEnvelope.request.apiRequest.slots[slot].resolutions &&
      handlerInput.requestEnvelope.request.apiRequest.slots[slot].resolutions.resolutionsPerAuthority) {

      for ( var i = 0; i < handlerInput.requestEnvelope.request.apiRequest.slots[slot].resolutions.resolutionsPerAuthority.length; i++) {
        if (
          handlerInput.requestEnvelope.request.apiRequest.slots[slot].resolutions.resolutionsPerAuthority[i] &&
          handlerInput.requestEnvelope.request.apiRequest.slots[slot].resolutions.resolutionsPerAuthority[i].values &&
          handlerInput.requestEnvelope.request.apiRequest.slots[slot].resolutions.resolutionsPerAuthority[i].values[0]){
            let values = handlerInput.requestEnvelope.request.apiRequest.slots[slot].resolutions.resolutionsPerAuthority[i].values;
            for (var j =0; j < values.length; j++) {
                return values[j].value;
            }
        }
      }
    }
    if (handlerInput.requestEnvelope &&
      handlerInput.requestEnvelope.request &&
      handlerInput.requestEnvelope.request.apiRequest &&
      handlerInput.requestEnvelope.request.apiRequest.slots &&
      handlerInput.requestEnvelope.request.apiRequest.slots[slot] &&
      handlerInput.requestEnvelope.request.apiRequest.slots[slot].value) {
        return {id: handlerInput.requestEnvelope.request.apiRequest.slots[slot].value};
    }
    return undefined;
}

const memoizeInSession = (sessionAttrKey, fn) => {

    return async (handlerInput, ...args) => {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        return sessionAttrKey in sessionAttributes
            ? sessionAttributes[sessionAttrKey]
            : (
                sessionAttributes[sessionAttrKey] = await fn(handlerInput, ...args),
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes),
                Promise.resolve(sessionAttributes[sessionAttrKey])
              );
    }

}

const getShoppingListId = memoizeInSession('shoppingListId', async (handlerInput) => {

    const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();
    const listOfLists = await listClient.getListsMetadata();
    console.log('Found lists: ' + JSON.stringify(listOfLists));

    if (!listOfLists) {
      console.log('permissions are not defined');
      return null;
    }

    const foundList = listOfLists.lists.find((l) => Buffer.from(l.listId, 'base64').toString('utf8').endsWith('-SHOPPING_ITEM') );
    console.log('Found Shopping List: ' + foundList.listId);

    return foundList.listId;
});


const getLocale = (handlerInput) => handlerInput.requestEnvelope.request.locale;


module.exports = {
  getResolvedWordsAC,
  getShoppingListId,
  getLocale,
  memoizeInSession
};
