
declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: object, callback?: () => void): void;
    }
    const local: StorageArea;
  }
  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
    }
    function query(queryInfo: {
      active: boolean;
      currentWindow: boolean;
    }, callback: (result: Tab[]) => void): void;
    function sendMessage(tabId: number, message: any, responseCallback?: (response: any) => void): void;
  }
  namespace runtime {
    function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    interface MessageListener {
      addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void): void;
    }
    const onMessage: MessageListener;
  }
}
