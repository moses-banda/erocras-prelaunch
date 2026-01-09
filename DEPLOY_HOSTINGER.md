# Deploying Erocras Prelaunch to Hostinger

Your project is now updated and pushed to GitHub. Here is how to deploy it to Hostinger:

## Option 1: Git Deployment (Recommended)
This method ensures your site stays in sync with your code.

1.  Log in to your **Hostinger hPanel**.
2.  Navigate to **Websites** and select your domain.
3.  On the sidebar, find **Advanced** > **Git**.
4.  **Repository Configuration**:
    -   **Repository URL**: `https://github.com/moses-banda/erocras-prelaunch.git`
    -   **Branch**: `main`
    -   **Directory**: Leave as `/` (or empty) to deploy to the root of your public_html.
5.  Click **Create** or **Connect**.
6.  Once connected, you may need to click **Deploy** or **Pull** to fetch the latest files.
7.  Verify your site is live!

## Option 2: Manual Upload (If needed)
If you prefer to upload files manually:

1.  Open **File Manager** in Hostinger.
2.  Go to `public_html`.
3.  Delete any default files if this is a fresh install.
4.  Upload all files and folders from your local `erocras-prelaunch` folder:
    -   `index.html`
    -   `styles.css`
    -   `partners.css`
    -   `footer.js`
    -   `footer_imgs/`
    -   `snaps/`
    -   (You can skip `.git`, `README.md`, `LICENSE`)

## Recent Updates
I have automatically sanitized your filenames (removed spaces and parentheses) to ensure compatibility with web servers. Your `index.html` and other files have been updated to match these new names.
