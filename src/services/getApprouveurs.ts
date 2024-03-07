import { EmployeeApprouverURL } from "../API_END_POINTS/AchatModuleEndPoints";


// GET all sub product family 
export async function getApprouverList(matUser,idSubFamily, ResponceCenter) {
    try {
        const response = await fetch(EmployeeApprouverURL, {
          method: 'POST',
          headers: new Headers({ "Authorization": `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
          body:  JSON.stringify({"MatUser":matUser,"idSubFamily":idSubFamily, "respCenter":ResponceCenter })
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
    }
}
