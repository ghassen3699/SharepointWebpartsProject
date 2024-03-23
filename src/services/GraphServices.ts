import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { IPresence } from '../model/IPresence';

export default class GraphService {

    private context: WebPartContext;

    constructor(_context: WebPartContext) {
        this.context = _context;
    }

    /**
     * Gettinguser presence information
     * @param userId AAD user identity
     */
    public getPresence(userId: string): Promise<IPresence> {
        return new Promise<IPresence>((resolve, reject) => {
            this.context.msGraphClientFactory
                .getClient("3") // Init Microsoft Graph Client
                .then((client: MSGraphClientV3): Promise<IPresence> => {
                    return client
                        .api(`users/${userId}/presence`) //Get Presence method
                        .version("beta") // Beta version
                        .get((err, res) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            // Resolve presence object
                            resolve({
                                Availability: res.availability,
                                Activity: res.activity,
                            });
                        });
                });
        });
    }

    public async getUserId(userUPN: string): Promise<string> {
        try {
          const client = await this.context.msGraphClientFactory.getClient("3");
          const res = await client
            .api(`users/${userUPN}`)
            .version("beta")
            .get();
            
          // Assuming 'res' is a string containing presence data
          return res;
        } catch (error) {
          throw error; // Re-throw the error
        }
    }
}