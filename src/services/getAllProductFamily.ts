import { GET_FAMILY_PREPROD } from "../API_END_POINTS/AchatModuleEndPoints";

// GET all product family 
export async function getFamily() {
    try {
        const response = await fetch(GET_FAMILY_PREPROD, {
            method: 'GET',
            headers: new Headers({ 'Authorization': `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
        });
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.log(error);
    }
}