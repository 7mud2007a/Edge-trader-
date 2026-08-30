const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userId = document.getElementById("userId");
const authProvider = document.getElementById("authProvider");
const logoutButton = document.getElementById("logoutButton");
const loadingScreen = document.getElementById("loadingScreen");


async function loadDashboard() {

    try {

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        // No active session
        if (!session) {
            window.location.replace("index.html");
            return;
        }

        const user = session.user;

        // User name
        const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "Trader";

        userName.textContent = fullName;

        // Email
        userEmail.textContent =
            user.email || "Not available";

        // ID
        userId.textContent =
            user.id || "Not available";

        // Provider
        const provider =
            user.app_metadata?.provider || "email";

        authProvider.textContent =
            formatProvider(provider);

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        window.location.replace("index.html");

    } finally {

        hideLoading();

    }
}


function formatProvider(provider) {

    const providers = {
        google: "Google",
        facebook: "Facebook",
        linkedin_oidc: "LinkedIn",
        email: "Email & Password"
    };

    return providers[provider] || provider;
}


async function logout() {

    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out...";

    try {

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }

        window.location.replace("index.html");

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        logoutButton.disabled = false;
        logoutButton.textContent = "Logout";

        alert(
            "Unable to log out. Please try again."
        );

    }
}


function hideLoading() {

    if (!loadingScreen) return;

    loadingScreen.classList.add("hidden");

    setTimeout(() => {
        loadingScreen.remove();
    }, 300);
}


logoutButton.addEventListener(
    "click",
    logout
);


/*
    Keep dashboard protected if the
    authentication state changes.
*/

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (
            event === "SIGNED_OUT" ||
            !session
        ) {
            window.location.replace("index.html");
        }

    }
);


loadDashboard();
