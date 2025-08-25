import { Web } from "@pnp/sp/webs";
import { testUserOrdersBySubFamilyForDevAlight, userOrdersBySubFamily, userOrdersBySubFamilyForHichemAbdelkafi, userOrdersBySubFamilyForMariemSomaiUser } from "../userOrders/userOrders";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


// Function to convert the date format
export function convertDateFormat(inputDate) {
  if (!inputDate) return '';
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
export async function getUserIdByEmail(userID: string) {
  try {
    const userAD_mail = await this._graphService.getUserId(userID).mail

    const user = await Web(this.props.url).ensureUser(userAD_mail);
    return user.data.Id;
  } catch (error) {
    console.log(`Error getting user ID : ${error}`);
  }
}


// Get approuver n° in list of aprouvers
export function getApprobateurNiveau(currentUserId, data) {
  console.log(data[0].ApprobateurV1Id);
  if (currentUserId === data[0].ApprobateurV1Id[0] && currentUserId === data[0].ApprobateurV2Id[0]) {
    return 2
  } else {
    if (currentUserId === data[0].ApprobateurV1Id[0]) {
      console.log(1);
      return 1;
    } else if (currentUserId === data[0].ApprobateurV2Id[0]) {
      console.log(2);
      return 2;
    } else if (data[0].ApprobateurV3Id !== null && currentUserId === data[0].ApprobateurV3Id[0]) {
      console.log(3);
      return 3;
    } else if (currentUserId === data[0].ApprobateurV4Id[0]) {
      console.log(4);
      return 4;
    } else {
      console.log(0);
      return 0;
    }
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
export function checkRodondanceApprouvers(approuversData) {
  if (approuversData[0].ApprobateurV3Id !== null) {
    if (approuversData[0].ApprobateurV1Id.some(item => approuversData[0].ApprobateurV2Id.includes(item))) {
      return 12
    } else if (approuversData[0].ApprobateurV2Id.some(item => approuversData[0].ApprobateurV3Id.includes(item))) {
      return 23
    } else if (approuversData[0].ApprobateurV3Id.some(item => approuversData[0].ApprobateurV4Id.includes(item))) {
      return 34
    } else {
      return -1
    }
  } else {
    if (approuversData[0].ApprobateurV1Id.some(item => approuversData[0].ApprobateurV2Id.includes(item))) {
      return 12
    } else if (approuversData[0].ApprobateurV2Id.some(item => approuversData[0].ApprobateurV4Id.includes(item))) {
      return 24
    } else {
      return -1
    }
  }
}


// function to convert this of request to ERP format
export function convertProductListSchema(listProducts) {
  var newListProductSchema = [];
  console.log(listProducts)
  if (listProducts.length > 0) {
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
export function createObjectFile(ArticleFileData) {
  const file = new File([], ArticleFileData.name, { type: ArticleFileData.type });
  return file;
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
  let allArticles = [];
  formData.map(article => {
    if (article.ArticleSelected.length > 0) {
      allArticles.push(article.ArticleSelected[0])
    }
  })
  return allArticles
}

// Function to return all articles list data 
export function getAllArticlesWithBenef(formData) {
  let allArticles = [];
  formData.map(article => {
    if (article.ArticleSelected.length > 0) {
      allArticles.push(
        {
          Axe: article.ArticleSelected[0]?.Axe,
          BudgetAnnualAllocated: article.ArticleSelected[0]?.BudgetAnnualAllocated,
          BudgetAnnualRemaining: article.ArticleSelected[0]?.BudgetAnnualRemaining,
          BudgetAnnualUsed: article.ArticleSelected[0]?.BudgetAnnualUsed,
          LatestPurchasePrice: article.ArticleSelected[0]?.LatestPurchasePrice,
          key: article.ArticleSelected[0]?.key,
          text: article.ArticleSelected[0]?.text,
          Beneficiaire: article.BeneficiareSelected[0]?.text
        })
    }
  })
  return allArticles
}

export function removeDuplicatesForArticlesWithBenef(array) {
  return array.filter((obj, index, self) => {
    return self.findIndex(item => item.Beneficiaire === obj.Beneficiaire && item.key === obj.key) === index;
  });
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


export function checkRemplacantByID(approbateurdD_1, approbateurId_2, approbateurId_3, approbateurId_4, currentUserId) {
  if (approbateurId_3 === null) {
    if (approbateurdD_1.includes(currentUserId) && approbateurId_2.includes(currentUserId)) {
      return 12
    } else if (approbateurId_2.includes(currentUserId) && approbateurId_4.includes(currentUserId)) {
      return 24
    }
    return 0
  } else {
    if (approbateurdD_1.includes(currentUserId) && approbateurId_2.includes(currentUserId)) {
      return 12
    } else if (approbateurId_2.includes(currentUserId) && approbateurId_3.includes(currentUserId)) {
      return 23
    } else if (approbateurId_3.includes(currentUserId) && approbateurId_4.includes(currentUserId)) {
      return 34
    }
    return 0
  }
}


export function checkUserOrders(demandeSubFamilyID) {
  const userOrdersList = userOrdersBySubFamily;
  const userOrder = userOrdersList.filter(order => order.idSubFamily === demandeSubFamilyID);
  if (userOrder.length > 0) {
    return userOrder
  } else {
    return []
  }
}


export function checkUserOrdersForMariemUser(demandeSubFamilyID) {
  const userOrdersList = userOrdersBySubFamilyForMariemSomaiUser;
  const userOrder = userOrdersList.filter(order => order.idSubFamily === demandeSubFamilyID);
  if (userOrder.length > 0) {
    return userOrder
  } else {
    return []
  }
}

export function checkUserOrdersForHichemUser(demandeSubFamilyID) {
  const userOrdersList = userOrdersBySubFamilyForHichemAbdelkafi;
  const userOrder = userOrdersList.filter(order => order.idSubFamily === demandeSubFamilyID);
  if (userOrder.length > 0) {
    return userOrder
  } else {
    return []
  }
}

export function checkUserOrdersForTestDevAlight(demandeSubFamilyID) {
  const userOrdersList = testUserOrdersBySubFamilyForDevAlight;
  const userOrder = userOrdersList.filter(order => order.idSubFamily === demandeSubFamilyID);
  if (userOrder.length > 0) {
    return userOrder
  } else {
    return []
  }
}


export function getMatchingIndices(list) {
  const targetPhrase = "L'équipe achats a modifié la date souhaitée";
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


export function updateString(str) {
  if (str === "Annuler") {
    return "Annulée";
  }
  return str;
}

// "POLYTECH" 03010
export function getApprouverListOrder(subfamily, beneficiaire, listSubfamilysApprouvers) {
  var subfamilyList, orderItem
  subfamilyList = listSubfamilysApprouvers.find(item => item.Respcenter === beneficiaire);

  if (subfamilyList && subfamilyList.Subfamilylist.length > 0) {
    orderItem = subfamilyList.Subfamilylist.find(sub => sub.IdSubFamily === subfamily);
    return orderItem ? orderItem.Order : [0];
  }

  return [0];
}


export function checkListApprouvers(listApprouvers) {
  console.log(listApprouvers)

  if (listApprouvers.length < 2) return true;

  const getKey = (item) => `${item.MatApp1}-${item.MatApp2}-${item.MatApp3}-${item.MatApp4}`;

  const referenceList = listApprouvers[0].approvalsList.map(getKey);

  for (const article of listApprouvers) {
    const currentList = article.approvalsList.map(getKey);

    // Compare values one by one (same order)
    for (let i = 0; i < currentList.length; i++) {
      if (currentList[i] !== referenceList[i]) {
        return false;
      }
    }
  }

  return true;
}


export function checkStatusListApprouvers(listApprouversForEachArticles) {
  if (listApprouversForEachArticles.length > 0) {
    listApprouversForEachArticles.map(article => {
      if (article.Status !== "200") return false
    })
    return true
  }
  return false
}


export function getArticles(articles) {
  return articles.reduce((acc, article, index) => {
    if (!article) return acc;

    acc[`Article ${index + 1}`] = article.DescriptionTechnique || "";
    acc[`Réference article ${index + 1}`] = article.ArticleREF || "";
    acc[`Sous Famille article ${index + 1}`] = article.SousFamille || "";
    acc[`Béneficiaire article ${index + 1}`] = article.Beneficiaire || "";
    acc[`Quantite article ${index + 1}`] = article.quantité || "";
    acc[`Prix Article ${index + 1}`] = article.Prix || "";
    acc[`DelaiLivraisionSouhaite article ${index + 1}`] = article.DelaiLivraisionSouhaite || "";
    acc[`Axe article ${index + 1}`] = article.Axe || "";
    acc[`Budget annuel alloué article ${index + 1}`] = article.BudgetAnnualAllocated || "";
    acc[`Budget annuel restant article ${index + 1}`] = article.BudgetAnnualRemaining || "";
    acc[`Budget annuel utilisé article ${index + 1}`] = article.BudgetAnnualUsed || "";
    return acc;
  }, {} as { [key: string]: string });
}

export function exportJsonToExcel(jsonData, fileName) {
  console.log("----------------- Data to Export -----------------");
  var dataToExport = []

  jsonData.map(demande => {
    const articles = JSON.parse(demande.Produit) || [];
    const articlesRows = articles.map(article => ({
      "Numero Demande": demande.ID.toString() || "",
      "Demandeur": demande.CreerPar || "",
      "Centre de gestion": demande.CentreDeGestion || "",
      "Famille demande": demande.FamilleProduit || "",
      "Date de la demande": demande.Created || "",
      "Statut de la demande": demande.StatusDemande || "",
      // "Approbateur NV1": "***",
      "Status Approbateur NV1": demande.StatusDemandeV1 || "",
      "Date Approbation NV1": demande.DateStatusDemandeV1 || "",
      // "Approbateur NV2": "***",
      "Status Approbateur NV2": demande.StatusDemandeV2 || "",
      "Date Approbation NV2": demande.DateStatusDemandeV2 || "",
      // "Approbateur NV3": "***",
      "Status Approbateur NV3": demande.StatusDemandeV3 || "",
      "Date Approbation NV3": demande.DateStatusDemandeV3 || "",
      // "Approbateur NV4": "***",
      "Status Approbateur NV4": demande.StatusDemandeV4 || "",
      "Date Approbation NV4": demande.DateStatusDemandeV4 || "",
      "Prix estimatif Total": demande.PrixTotal || "",
      ...getArticles(articles)
    }));
    dataToExport.push(...articlesRows);
  })

  console.log(dataToExport)


  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
}