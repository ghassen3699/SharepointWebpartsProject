import { GetFamilleProduit } from "../API_END_POINTS/AchatModuleEndPoints";

export const getFamilyProduct = async ()=> {
    const url = GetFamilleProduit
    const apiKey = '326b39c0';
  
    console.log(GetFamilleProduit)
    try {
      const response = await fetch(url, {
        headers: {
          'X-API-Key': apiKey,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error.message);
      throw error; // You can choose to handle the error differently if needed
    }
  };