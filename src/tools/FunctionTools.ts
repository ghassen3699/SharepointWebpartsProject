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
  if (currentUserId === data[0].ApprobateurV1Id[0]){
    return 1
  }else if (currentUserId === data[0].ApprobateurV2Id[0]){
    return 2
  }else if (currentUserId === data[0].ApprobateurV3Id[0]){
    return 3
  }else if (data[0].ApprobateurV4Id !== null){
    if (currentUserId === data[0].ApprobateurV4Id[0]){
      return 4
    }
  }else {
    return 0
  }
}
