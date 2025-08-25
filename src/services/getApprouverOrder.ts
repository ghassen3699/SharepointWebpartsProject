import { ApprouverOrderURL_PROD } from "../API_END_POINTS/AchatModuleEndPoints";

// GET all Approuvers
export async function getApprouverOrder(MatApprobateur) {
    try {
        const response = await fetch(ApprouverOrderURL_PROD, {
            method: 'POST',
            headers: new Headers({ "Authorization": `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
            body: JSON.stringify({ "MatApprobateur": MatApprobateur })
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
    }
}
