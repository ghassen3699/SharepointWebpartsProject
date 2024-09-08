import { Web } from "@pnp/sp/webs";
import { userOrdersBySubFamily } from "../userOrders/userOrders";

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


// check if articles in request with same axe
export function checkIfAxeExists(arrayOfObjects, axe) {
  for (let i = 0; i < arrayOfObjects.length; i++) {
      if (arrayOfObjects[i].Axe === axe) {
          return true; 
      }
  }
  return false;
}

// Get user ID by her Email
export async function getUserIdByEmail(userID: string){
  try {
    const userAD_mail = await this._graphService.getUserId(userID).mail

    const user = await Web(this.props.url).ensureUser(userAD_mail);
    return user.data.Id;
  } catch (error) {
    console.log(`Error getting user ID : ${error}`);
  }
}


// Get approuver n° in list of aprouvers
export function getApprobateurNiveau(currentUserId, data){
  console.log(data[0].ApprobateurV1Id);
  if (currentUserId === data[0].ApprobateurV1Id[0]){
    console.log(1);
    return 1;
  } else if (currentUserId === data[0].ApprobateurV2Id[0]){
    console.log(2);
    return 2;
  } else if (data[0].ApprobateurV3Id !== null && currentUserId === data[0].ApprobateurV3Id[0]){
    console.log(3);
    return 3;
  } else if (currentUserId === data[0].ApprobateurV4Id[0]){
    console.log(4);
    return 4;
  } else {
    console.log(0);
    return 0;
  }
}


// Get approuver n° in list of aprouvers
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

// check if we have same approuvers in the list or not
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


// function to convert this of request to ERP format
export function convertProductListSchema(listProducts) {
  var newListProductSchema = [] ;
  console.log(listProducts)
  if(listProducts.length > 0 ) {
    listProducts.map(product => {
      newListProductSchema.push({
        "RefItem": product.ArticleREF,
        "ItemDescription": product.comment,
        "Quantity": product.quantité,
        "EstimatePrice": product.Prix,
        "DesiredDeliveryTime": product.DelaiLivraisionSouhaite,
        "BeneficiaryCenter": product.Beneficiaire
      })
    })
  }
  return newListProductSchema
}


// Create the object of file
export function createObjectFile(ArticleFileData){
  const file = new File([], ArticleFileData.name, { type: ArticleFileData.type });
  return file ;
}

// Convert the file content to Base 64
export async function convertFileToBase64(file) {
  if (!(file instanceof Blob)) {
    throw new TypeError("Parameter 'file' must be a Blob object.");
  }

  try {
    const reader = new FileReader();
    const result = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
    console.log(result)
    return result.toString();
  } catch (error) {
    throw error;
  }
}


// Function to return all articles list data 
export function getAllArticles(formData) {
  let allArticles = [] ;
  formData.map(article => {
    if (article.ArticleSelected.length > 0){
      allArticles.push(article.ArticleSelected[0])
    }
  })
  return allArticles
}

export function removeDuplicates2(array) {
  return array.filter((obj, index, self) => {
    return self.findIndex(item => item.Axe === obj.Axe) === index;
  });
}


export function getOrderFilter(Filter1, Filter2) {
  if (Filter1 === "TOUS") {
    return Filter2 === "TOUS" ? 1 : 2;
  } else {
    return Filter2 === "TOUS" ? 3 : 4;
  }
}


export function convertStringToNumber(input) {
  let cleanedString = input.replace(/\s/g, '');
  cleanedString = cleanedString.replace(',', '.');
  const result = parseFloat(cleanedString);

  if (isNaN(result)) {
      throw new Error('Invalid number format');
  }

  return result;
}


export function checkRemplacantByID(approbateurdD_1, approbateurId_2, approbateurId_3, approbateurId_4, currentUserId){
  if(approbateurId_3 === null){
    if (approbateurdD_1.includes(currentUserId) && approbateurId_2.includes(currentUserId)){
      return 12
    }else if (approbateurId_2.includes(currentUserId) && approbateurId_4.includes(currentUserId) ){
      return 24
    }
    return 0
  }else {
    if (approbateurdD_1.includes(currentUserId) && approbateurId_2.includes(currentUserId)){
      return 12
    }else if (approbateurId_2.includes(currentUserId) && approbateurId_3.includes(currentUserId)){
      return 23
    }else if (approbateurId_3.includes(currentUserId) && approbateurId_4.includes(currentUserId)){
      return 34
    }
    return 0
  }
}


export function checkUserOrders(demandeSubFamilyID){
  const userOrdersList = userOrdersBySubFamily ;
  const userOrder = userOrdersList.filter(order => order.idSubFamily === demandeSubFamilyID);
  if (userOrder.length > 0){
    return userOrder
  }else {
    return []
  }
}


export function getMatchingIndices(list) {
  const targetPhrase = "L'équipe finance a modifié la date souhaitée";
  const matchingIndices = [];

  list.forEach((item, index) => {
      if (item.startsWith(targetPhrase)) {
          matchingIndices.push(index);
      }
  });

  return matchingIndices;
}


export function extractArticleAndDays(text) {
  const regex = /article (\d+).* aprés (\d+) jours/;
  const match = text.match(regex);

  if (match) {
      const articleNumber = parseInt(match[1], 10);
      const numberOfDays = parseInt(match[2], 10);
      return { articleNumber, numberOfDays };
  } else {
      return null;
  }
}