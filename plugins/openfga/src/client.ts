import fetch from 'node-fetch';
import { Config } from '@backstage/config';

// Interfaces for your OpenFga API request and response (adjust as needed)
interface OpenFgaRequest {
  tuple_key: { user: string; relation: string; object: string };
  authorization_model_id: string;
}

interface OpenFgaResponse {
  allowed: boolean; // Assuming your response includes an "allowed" property
}

let permissionResponse: OpenFgaResponse | null = null;

/**
 * Makes a call to your OpenFGA API to check permissions.
 * @param entityName The name of the entity for which permission is being checked.
 * @param action The action (e.g., "Read", "Delete") for which permission is being checked.
 * @param config The backend configuration object.
 */

export function getPermissionResponse(): OpenFgaResponse | null {
    return permissionResponse;
  }

export async function sendPermissionRequest(entityName: string, action: string, config: Config): Promise<OpenFgaResponse> {
//   const openFgaBaseUrl = config.getOptionalString('openfga.baseUrl');
//   const openFgaStoreId = config.getOptionalString('openfga.storeId');
const openFgaBaseUrl = 'http://localhost:8080'
const openFgaStoreId = '01J1YP1XGYE6AD7ZYENKCV0CD9';

  if (!openFgaBaseUrl || !openFgaStoreId) {
    throw new Error('OpenFGA configuration missing in app-config.yaml');
  }

  const url = `${openFgaBaseUrl}/stores/${openFgaStoreId}/check`;

  const relation = action.toLowerCase() === 'delete' ? 'catalog_entity_delete' : 'catalog_entity_read'; // Adjust relation based on action

  const requestBody: OpenFgaRequest = {
    tuple_key: {
      user: 'user:guest',
      relation,
      object: `catalog_entity:${entityName}`, 
    },
    authorization_model_id: '01J1YP4ZSDHJH453RYRVY171AX',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`OpenFGA API call failed with status: ${response.status}`);
  }

  const data: OpenFgaResponse = await response.json();
  permissionResponse = data; 
  return data;
}
