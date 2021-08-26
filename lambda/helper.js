
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
        return {name: handlerInput.requestEnvelope.request.apiRequest.slots[slot].value};
    }
    return undefined;
}

const getShoppingListId = async function(handlerInput) {
  // check session attributes to see if it has already been fetched
  const attributesManager = handlerInput.attributesManager;
  const sessionAttributes = attributesManager.getSessionAttributes();
  let listId;

  if (!sessionAttributes.shoppingListId) {
    // lookup the id for the 'to do' list
    const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();
    const listOfLists = await listClient.getListsMetadata();
    console.log(JSON.stringify(listOfLists));
    if (!listOfLists) {
      console.log('permissions are not defined');
      return null;
    }
    for (let i = 0; i < listOfLists.lists.length; i += 1) {
      console.log(`found ${listOfLists.lists[i].name} with id ${listOfLists.lists[i].listId}`);
      const decodedListId = Buffer.from(listOfLists.lists[i].listId, 'base64').toString('utf8');
      console.log(`decoded listId: ${decodedListId}`);
      // The default lists (To-Do and Shopping List) list_id values are base-64 encoded strings with these formats:
      //  <Internal_identifier>-TASK for the to-do list
      //  <Internal_identifier>-SHOPPING_ITEM for the shopping list
      // Developers can base64 decode the list_id value and look for the specified string at the end. This string is constant and agnostic to localization.
      if (decodedListId.endsWith('-SHOPPING_ITEM')) {
        // since we're looking for the default to do list, it's always present and always active
        sessionAttributes.shoppingListId = listOfLists.lists[i].listId;
        break;
      }
    }
  }
  console.log(JSON.stringify(handlerInput));
  return sessionAttributes.shoppingListId;
}


module.exports = {
  getResolvedWordsAC,
  getShoppingListId
};
