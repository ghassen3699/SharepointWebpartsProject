import { GET_SUB_FAMILY_PREPROD } from "../API_END_POINTS/AchatModuleEndPoints";


// GET all sub product family 
export async function getSubFamily(idSubFamily) {
    try {
        const response = await fetch(GET_SUB_FAMILY_PREPROD, {
          method: 'POST',
          headers: new Headers({ "Authorization": `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
          body:  JSON.stringify({"IdSubFamily":idSubFamily})
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
    }
}
