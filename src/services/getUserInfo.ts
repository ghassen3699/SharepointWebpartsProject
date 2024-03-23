import { EmployeeInfoURL } from "../API_END_POINTS/AchatModuleEndPoints";


// GET all user info
export async function getUserInfo(establishment, registrationNumber) {
  try {
      const response = await fetch(EmployeeInfoURL + "/" + registrationNumber + "/" + establishment, {
        method: 'POST',
        headers: new Headers({ "Authorization": `Basic ${btoa(`testUCG:testUCG`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
      });
      const data = await response.json();
      console.log(data)
      return data
    } catch (error) {
      console.log(error);
    }
}