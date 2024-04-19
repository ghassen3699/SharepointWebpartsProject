import { Web } from "@pnp/sp/webs";

// Function to convert the date format
export function convertDateFormat(inputDate) {
  const dateParts = inputDate.split('T')[0].split('-');
  const day = dateParts[2];
  const month = dateParts[1];
  const year = dateParts[0];
  return `${day}/${month}/${year}`;
}


// function to Get the current Date 
export function getCurrentDate() {
  const currentDate = new Date();
  
  // Get day, month, and year components
  const day = ('0' + currentDate.getUTCDate()).slice(-2);
  const month = ('0' + (currentDate.getUTCMonth() + 1)).slice(-2); // Months are zero-based
  const year = currentDate.getUTCFullYear();

  // Assemble the date in the desired format
  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
}



export function checkIfAxeExists(arrayOfObjects, axe) {
  for (let i = 0; i < arrayOfObjects.length; i++) {
      if (arrayOfObjects[i].Axe === axe) {
          return true; 
      }
  }
  return false;
}


export async function getUserIdByEmail(userID: string){
  try {
    const userAD_mail = await this._graphService.getUserId(userID).mail

    const user = await Web(this.props.url).ensureUser(userAD_mail);
    return user.data.Id;
  } catch (error) {
    console.log(`Error getting user ID : ${error}`);
  }
}

export function getApprobateurNiveau(currentUserId, data){
  console.log(data[0].ApprobateurV1Id);
  if (currentUserId === data[0].ApprobateurV1Id){
    console.log(1);
    return 1;
  } else if (currentUserId === data[0].ApprobateurV2Id){
    console.log(2);
    return 2;
  } else if (data[0].ApprobateurV3Id !== null && currentUserId === data[0].ApprobateurV3Id){
    console.log(3);
    return 3;
  } else if (currentUserId === data[0].ApprobateurV4Id){
    console.log(4);
    return 4;
  } else {
    console.log(0);
    return 0;
  }
}

function checkLists(approbateurList1, approbateurList2, approbateurList3, approbateurList4) {
  if (approbateurList1.some(item => approbateurList2.includes(item))) {
      return 12;
  } else if (approbateurList2.some(item => approbateurList3.includes(item))) {
      return 23;
  } else if (approbateurList3.some(item => approbateurList4.includes(item))) {
      return 34;
  } else {
      return -1; // Or any other value to indicate no match found
  }
}

export function checkRodondanceApprouvers(approuversData){
  if (approuversData[0].ApprobateurV3Id !== null){
    if (approuversData[0].ApprobateurV1Id.some(item => approuversData[0].ApprobateurV2Id.includes(item))){
      return 12
    }else if (approuversData[0].ApprobateurV2Id.some(item => approuversData[0].ApprobateurV3Id.includes(item))){
      return 23
    }else if (approuversData[0].ApprobateurV3Id.some(item => approuversData[0].ApprobateurV4Id.includes(item))){
      return 34
    }else {
      return -1
    }
  }else {
    if (approuversData[0].ApprobateurV1Id.some(item => approuversData[0].ApprobateurV2Id.includes(item))){
      return 12
    }else if (approuversData[0].ApprobateurV2Id.some(item => approuversData[0].ApprobateurV4Id.includes(item))){
      return 24
    }else {
      return -1
    }
  }
}


export function convertProductListSchema(listProducts) {
  var newListProductSchema = [] ;
  if(listProducts.length > 0 ) {
    listProducts.map(product => {
      newListProductSchema.push({
        "RefItem": product.ArticleREF,
        "ItemDescription": product.DescriptionTechnique,
        "Quantity": product.quantité,
        "EstimatePrice": product.Prix,
        "DesiredDeliveryTime": "0"
      })
    })
  }
  return newListProductSchema
}