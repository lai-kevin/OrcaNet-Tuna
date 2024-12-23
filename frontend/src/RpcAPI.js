import axios from "axios";

//'http://localhost:1234/rpc' old route
// http://host.docker.internal:8081/rpc
const rpcClient = axios.create({
  baseURL: 'http://localhost:8081/rpc',
  headers: {
    'Content-Type': 'application/json',
  }
});

const makeRPCRequest = async (method, params) => {
  try {
    const response = await rpcClient.post('', {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Date.now()
    });
    
    if (response.data.error) {
      throw new Error(response.data.error.message || 'Unknown RPC error');
    }
    
    return response.data; // result usually contains the actual content of the response
  } catch (error) {
    if (error.response) {
      console.error(`RPC Error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      console.error('RPC Error: No response received');
    } else {
      console.error('RPC Error:', error.message);
    }
    throw error;
  }
};

//If you want to modify these to have some handling other than just returning the result just modify func def

//params should be: [{"file_path": "path", "price": NumOrcaCoin }]
export const uploadFileRPC = (params) => 
  makeRPCRequest('FileShareService.ProvideFile', params);

//params should be: [{"file_hash": "HASH", "peer_id": "peerID" }] dial to self not allowed bruh lol
export const getFileRPC = (params) => 
  makeRPCRequest('FileShareService.GetFile', params);

//params should be: [{"file_hash": "HASHID", "peer_id": "peerID"}]
export const getFileMetaDataRPC = (params) => 
  makeRPCRequest('FileShareService.GetFileMetaData', params);

//params can be: []
export const getHistory = (params) => 
  makeRPCRequest('FileShareService.GetHistory', params);

//params should be: [{"file_hash" : "Hash"}]
export const getFileProviders = (params) => 
  makeRPCRequest('FileShareService.GetProviders',params);
//same as get file providers we are just gonna chain with calls for getting file metadata
export const getFileProvidersWMetaData = async (params) =>{
  let providersFetch = await getFileProviders(params);
  let providers = providersFetch.result.providers
  providers = providers.filter(providerId => providerId !== "");//for some reason some files have a "" as a provider ?
  console.log(providers);
  if (providers.length === 0){
    return {providers: []};
  }
  const providersWithMetadata = await Promise.all(
    providers.map(async (providerId) => {
      // Call getFileMetaDataRPC with necessary parameters for each provider
      
      const metadataResponse = await getFileMetaDataRPC([{
        file_hash: params[0].file_hash,
        peer_id: providerId
      }]);
      console.log("heyo")
      console.log(metadataResponse.result);
      return {
        id: providerId,
        ...metadataResponse.result.file_meta_data
      };
    })
  );

  console.log(providersWithMetadata);
  return {name: providersWithMetadata[0].FileName , size: providersWithMetadata[0].FileSize, providers: providersWithMetadata, success: true };

  
}

//params should be: [{"file_hash" : "HASH"}]
export const stopProvidingRPC = (params) =>
  makeRPCRequest('FileShareService.StopProvidingFile', params);

export const resumeProvidingRPC = (params) =>
  makeRPCRequest('FileShareService.ResumeProvidingFile', params);


//params can be: []
export const getUpdatesFromGoNode = (params) =>
  makeRPCRequest('FileShareService.GetUpdates', params);//has downloads, and providing field

//params are : [{request_id: reqIdNum}]
export const pauseDownloadFileRPC = (params) => 
  makeRPCRequest('FileShareService.PauseDownload',params)

//params are : [{request_id: reqIdNum}]
export const resumeDownloadFileRPC = (params) => 
  makeRPCRequest('FileShareService.ResumeDownload',params)