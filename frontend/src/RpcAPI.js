import axios from "axios";

const rpcClient = axios.create({
  baseURL: 'http://localhost:1234/rpc',
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
    
    return response.data.result;
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

//params should be: [{"file_path": "path", "price": NumOrcaCoin }]
export const uploadFileRPC = (params) => 
  makeRPCRequest('FileShareService.ProvideFile', params);

//params should be: [{"file_hash": "HASH"}] dial to self not allowed bruh lol
export const getFileRPC = (params) => 
  makeRPCRequest('FileShareService.GetFile', params);

//params should be: [{"file_hash": "HASH"}]
export const getFileMetaDataRPC = (params) => 
  makeRPCRequest('FileShareService.GetFileMetaData', params);

//params can be: []
export const getHistory = (params) => 
  makeRPCRequest('FileShareService.GetHistory', params);