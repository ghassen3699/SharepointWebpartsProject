import { EmployeeApprouverURL } from "../API_END_POINTS/AchatModuleEndPoints";


// GET Beneficiaire permission by each user
export async function getBenefList(matUser) {
    try {
        const response = await fetch(EmployeeApprouverURL, {
          method: 'POST',
          headers: new Headers({ "Authorization": `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
          body:  JSON.stringify({"MatUser":matUser})
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
    }
}
