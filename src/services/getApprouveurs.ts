import { EmployeeApprouverURL } from "../API_END_POINTS/AchatModuleEndPoints";


// GET all Approuvers
export async function getApprouverList(idSubFamily, ResponceCenter) {
    try {
        const response = await fetch(EmployeeApprouverURL, {
          method: 'POST',
          headers: new Headers({ "Authorization": `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
          body:  JSON.stringify({"idSubFamily":idSubFamily, "respCenter":ResponceCenter })
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
    }
}
