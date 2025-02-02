import React, {createContext, useState} from "react";

type clientContextType = {
    clientId: number | null
    selectClient: () => void
    clearClientState: () => void
}

// const ClientContext = createContext<clientContextType>({
//     clientId: null
// })

export const ClientProvider = ({children}: {children: React.ReactNode}) => {
    const [clientId, setClientId] = useState<number | null>(null)


}