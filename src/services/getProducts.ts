import { GET_PRODUCTS } from "../API_END_POINTS/AchatModuleEndPoints";


// GET all product family 
export async function getProduct(idSubFamily, ResponceCenter) {
    try {

        console.log("test result:  ", idSubFamily, ResponceCenter);
        const response = await fetch(GET_PRODUCTS, {
            method: 'POST',
            headers: new Headers({ "Authorization": `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
            body: JSON.stringify({ "IdSubFamily": idSubFamily, "RespCenter": ResponceCenter })
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
    }
}
