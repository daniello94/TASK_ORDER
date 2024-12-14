module.exports = {
    en: {
        subject: (projectName) => `New Order for Project: ${projectName}`,
        body: (projectName, orderedProductNames, comments, userName, userLastName) => `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                        <h2 style="color: #0073e6;">A New Order Has Been Placed</h2>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Project:</b> ${projectName}</p>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Ordered Products:</b></p>
                        <div style="padding-left: 20px; font-size: 15px; color: #2c3e50;">${orderedProductNames || "None"}</div>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Comments:</b> ${comments || 'None'}</p>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Order Placed By:</b> ${userName || 'Unknown User'} ${userLastName || ''}</p>
                        <hr style="border: 1px solid #ddd; margin: 20px 0;">
                        <h4 style="color: #0073e6;">Additional Information:</h4>
                        <p style="font-size: 14px; color: #555;">Please find additional information regarding the order below.</p>
                    </div>
                </body>
            </html>
        `
    },
    pl: {
        subject: (projectName) => `Nowe zamówienie dla projektu: ${projectName}`,
        body: (projectName, orderedProductNames, comments, userName, userLastName) => `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                        <h2 style="color: #0073e6;">Nowe zamówienie zostało złożone</h2>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Projekt:</b> ${projectName}</p>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Produkty zamówione:</b></p>
                        <div style="padding-left: 20px; font-size: 15px; color: #2c3e50;">${orderedProductNames || "Brak"}</div>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Uwagi:</b> ${comments || 'Brak'}</p>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Zamówienie złożone przez:</b> ${userName || 'Nieznany użytkownik'} ${userLastName || ''}</p>
                        <hr style="border: 1px solid #ddd; margin: 20px 0;">
                        <h4 style="color: #0073e6;">Dodatkowe informacje:</h4>
                        <p style="font-size: 14px; color: #555;">Poniżej znajdują się dodatkowe informacje dotyczące zamówienia.</p>
                    </div>
                </body>
            </html>
        `
    },
    de: {
        subject: (projectName) => `Neue Bestellung für das Projekt: ${projectName}`,
        body: (projectName, orderedProductNames, comments, userName, userLastName) => `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                        <h2 style="color: #0073e6;">Neue Bestellung für das Projekt</h2>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Projekt:</b> ${projectName}</p>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Bestellte Produkte:</b></p>
                        <div style="padding-left: 20px; font-size: 15px; color: #2c3e50;">${orderedProductNames || "Keine"}</div>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Bemerkungen:</b> ${comments || "Keine"}</p>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Bestellung aufgegeben von:</b> ${userName || "Unbekannter Benutzer"} ${userLastName || ""}</p>
                        <hr style="border: 1px solid #ddd; margin: 20px 0;">
                        <h4 style="color: #0073e6;">Zusätzliche Informationen:</h4>
                        <p style="font-size: 14px; color: #555;">Weitere Informationen zur Bestellung finden Sie unten.</p>
                    </div>
                </body>
            </html>
        `
    },
    fr: {
        subject: (projectName) => `Nouvelle commande pour le projet : ${projectName}`,
        body: (projectName, orderedProductNames, comments, userName, userLastName) => `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                        <h2 style="color: #0073e6;">Une nouvelle commande a été passée</h2>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Projet :</b> ${projectName}</p>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Produits commandés :</b></p>
                        <div style="padding-left: 20px; font-size: 15px; color: #2c3e50;">${orderedProductNames || "Aucun"}</div>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Commentaires :</b> ${comments || 'Aucun'}</p>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Commande passée par :</b> ${userName || 'Utilisateur inconnu'} ${userLastName || ''}</p>
                        <hr style="border: 1px solid #ddd; margin: 20px 0;">
                        <h4 style="color: #0073e6;">Informations supplémentaires :</h4>
                        <p style="font-size: 14px; color: #555;">Veuillez trouver ci-dessous des informations supplémentaires concernant la commande.</p>
                    </div>
                </body>
            </html>
        `
    },
    nl: {
        subject: (projectName) => `Nieuwe bestelling voor project: ${projectName}`,
        body: (projectName, orderedProductNames, comments, userName, userLastName) => `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                        <h2 style="color: #0073e6;">Een nieuwe bestelling is geplaatst</h2>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Project:</b> ${projectName}</p>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Bestelde producten:</b></p>
                        <div style="padding-left: 20px; font-size: 15px; color: #2c3e50;">${orderedProductNames || "Geen"}</div>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Opmerkingen:</b> ${comments || 'Geen'}</p>
                        <p style="font-size: 16px; color: #2c3e50;"><b>Bestelling geplaatst door:</b> ${userName || 'Onbekende gebruiker'} ${userLastName || ''}</p>
                        <hr style="border: 1px solid #ddd; margin: 20px 0;">
                        <h4 style="color: #0073e6;">Aanvullende informatie:</h4>
                        <p style="font-size: 14px; color: #555;">Zie hieronder aanvullende informatie over de bestelling.</p>
                    </div>
                </body>
            </html>
        `
    }
};
