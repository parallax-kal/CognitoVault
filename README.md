## CognitoVault 🗝️

CognitoVault is an open-source browser extension designed to securely manage and transfer `localStorage` and cookies across different instances of a website. With CognitoVault, website owners can grant access to specific users without directly sharing their credentials.

### 🌟 Features

- **Secure Sharing**: Share access to your website by creating a vault containing `localStorage` and cookies.
- **Extension-based**: Currently available as a Chrome extension.
- **Import & Export**: Transfer vaults between different instances of a website.
- **Background Script**: Runs seamlessly in the background to manage and sync data.
- **Invite-Only Access**: Only users invited by the vault creator can import and access the stored data.

### 🛠️ How It Works

1. **Create a Vault**: Website owners can create a vault containing the necessary `localStorage` and cookies.
2. **Invite Users**: Send invitations to specific users to access your vault.
3. **Import Vaults**: Users with the CognitoVault extension can import the vault data into their instance of the website.

### 🚀 Technologies Used

- **Frontend**: React
- **Backend**: Firebase
- **Extension Platform**: Chrome Extension API

### 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cognitovault.git
   ```

2. Navigate to the project directory:
   ```bash
   cd cognitovault
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable Developer Mode.
   - Click on `Load unpacked` and select the `build` directory.

### 📘 Usage

1. **Export Data**: Navigate to the desired website and export the vault data.
2. **Invite Users**: Share the generated vault with specific users.
3. **Import Data**: Users can import the vault into their instance of the website using the CognitoVault extension.

### 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details.

### 📜 License

This project is licensed under this License. See [THE LICENSE](LICENSE) for more information.

---

Star this repository if you found it helpful!
