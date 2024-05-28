import { ClosedPurchaseOrderURL } from "../API_END_POINTS/AchatModuleEndPoints";


// GET all sub product family 
export async function getClosedPurchaseRequests(startDate, endDate, respCenter) {
    try {
        const response = await fetch(ClosedPurchaseOrderURL, {
          method: 'POST',
          headers: new Headers({ "Authorization": `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
          body:  JSON.stringify({"StartDate":startDate, "EndDate":endDate, "RespCenter": respCenter })
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
    }
}
