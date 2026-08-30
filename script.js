/* =========================================================
   EDGE TRADER
   Authentication Controller
   ========================================================= */

/*
    ضع بيانات Supabase الخاصة بمشروعك هنا:

    SUPABASE_URL
    SUPABASE_PUBLISHABLE_KEY

    لا تضع Service Role Key هنا أبداً.
*/

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";


/* =========================================================
   SUPABASE
   ========================================================= */

const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   ELEMENTS
   ========================================================= */

const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");

const signUpSubmit = document.getElementById("signUpSubmit");
const signInSubmit = document.getElementById("signInSubmit");

const signUpMessage = document.getElementById("signUpMessage");
const signInMessage = document.getElementById("signInMessage");

const forgotPasswordButton =
    document.getElementById("forgotPasswordButton");

const forgotPasswordModal =
    document.getElementById("forgotPasswordModal");

const closeForgotPassword =
    document.getElementById("closeForgotPassword");

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const forgotPasswordSubmit =
    document.getElementById("forgotPasswordSubmit");

const forgotPasswordMessage =
    document.getElementById("forgotPasswordMessage");


/* =========================================================
   PANEL SWITCH
   ========================================================= */

signUpButton.addEventListener("click", () => {
    clearMessages();
    container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
    clearMessages();
    container.classList.remove("right-panel-active");
});


/* =========================================================
   HELPERS
   ========================================================= */

function showMessage(element, message, type = "info") {
    if (!element) return;

    element.textContent = message;
    element.className = `auth-message ${type}`;
}

function clearMessages() {
    showMessage(signUpMessage, "");
    showMessage(signInMessage, "");
    showMessage(forgotPasswordMessage, "");
}

function setLoading(button, loading, text) {
    if (!button) return;

    if (loading) {
        button.dataset.originalText = button.textContent;
        button.disabled = true;
        button.textContent = text;
    } else {
        button.disabled = false;
        button.textContent =
            button.dataset.originalText || text;
    }
}


/* =========================================================
   SIGN UP
   ========================================================= */

signUpForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearMessages();

    const name =
        document.getElementById("signUpName").value.trim();

    const email =
        document.getElementById("signUpEmail").value.trim();

    const password =
        document.getElementById("signUpPassword").value;


    if (!name || !email || !password) {
        showMessage(
            signUpMessage,
            "Please fill in all fields.",
            "error"
        );
        return;
    }


    if (password.length < 6) {
        showMessage(
            signUpMessage,
            "Password must be at least 6 characters.",
            "error"
        );
        return;
    }


    setLoading(
        signUpSubmit,
        true,
        "Creating..."
    );


    try {

        const { data, error } =
            await supabaseClient.auth.signUp({

                email: email,
                password: password,

                options: {
                    data: {
                        full_name: name
                    }
                }

            });


        if (error) {
            throw error;
        }


        if (data.session) {

            showMessage(
                signUpMessage,
                "Account created successfully.",
                "success"
            );

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 700);

        } else {

            showMessage(
                signUpMessage,
                "Account created. Check your email to verify your account.",
                "success"
            );

        }

    } catch (error) {

        showMessage(
            signUpMessage,
            getAuthError(error),
            "error"
        );

    } finally {

        setLoading(
            signUpSubmit,
            false,
            "Sign Up"
        );

    }

});


/* =========================================================
   SIGN IN
   ========================================================= */

signInForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearMessages();

    const email =
        document.getElementById("signInEmail").value.trim();

    const password =
        document.getElementById("signInPassword").value;


    if (!email || !password) {

        showMessage(
            signInMessage,
            "Please enter your email and password.",
            "error"
        );

        return;
    }


    setLoading(
        signInSubmit,
        true,
        "Signing In..."
    );


    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,
                password: password

            });


        if (error) {
            throw error;
        }


        if (data.session) {

            showMessage(
                signInMessage,
                "Login successful.",
                "success"
            );

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);

        }

    } catch (error) {

        showMessage(
            signInMessage,
            getAuthError(error),
            "error"
        );

    } finally {

        setLoading(
            signInSubmit,
            false,
            "Sign In"
        );

    }

});


/* =========================================================
   SOCIAL LOGIN
   ========================================================= */

const socialButtons =
    document.querySelectorAll(
        ".social-container .social"
    );


socialButtons.forEach((button) => {

    button.addEventListener("click", async () => {

        const provider =
            button.dataset.provider;

        if (!provider) return;


        try {

            button.disabled = true;


            const { error } =
                await supabaseClient.auth.signInWithOAuth({

                    provider: provider,

                    options: {
                        redirectTo:
                            window.location.origin +
                            "/dashboard.html"
                    }

                });


            if (error) {
                throw error;
            }

        } catch (error) {

            button.disabled = false;

            showMessage(
                signInMessage,
                getAuthError(error),
                "error"
            );

        }

    });

});


/* =========================================================
   FORGOT PASSWORD MODAL
   ========================================================= */

forgotPasswordButton.addEventListener(
    "click",
    () => {

        clearMessages();

        forgotPasswordModal.classList.add("active");

        forgotPasswordModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document
            .getElementById("forgotPasswordEmail")
            .focus();

    }
);


closeForgotPassword.addEventListener(
    "click",
    closeForgotModal
);


forgotPasswordModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            forgotPasswordModal
        ) {
            closeForgotModal();
        }

    }
);


function closeForgotModal() {

    forgotPasswordModal.classList.remove("active");

    forgotPasswordModal.setAttribute(
        "aria-hidden",
        "true"
    );

    showMessage(
        forgotPasswordMessage,
        ""
    );

}


/* =========================================================
   FORGOT PASSWORD REQUEST
   ========================================================= */

forgotPasswordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        showMessage(
            forgotPasswordMessage,
            ""
        );


        const email =
            document
                .getElementById("forgotPasswordEmail")
                .value
                .trim();


        if (!email) {

            showMessage(
                forgotPasswordMessage,
                "Please enter your email.",
                "error"
            );

            return;
        }


        setLoading(
            forgotPasswordSubmit,
            true,
            "Sending..."
        );


        try {

            const { error } =
                await supabaseClient.auth
                    .resetPasswordForEmail(
                        email,
                        {
                            redirectTo:
                                window.location.origin +
                                "/reset-password.html"
                        }
                    );


            if (error) {
                throw error;
            }


            showMessage(
                forgotPasswordMessage,
                "Reset link sent. Check your email.",
                "success"
            );


        } catch (error) {

            showMessage(
                forgotPasswordMessage,
                getAuthError(error),
                "error"
            );

        } finally {

            setLoading(
                forgotPasswordSubmit,
                false,
                "Send Reset Link"
            );

        }

    }
);


/* =========================================================
   AUTH SESSION
   ========================================================= */

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (
            event === "SIGNED_IN" &&
            session
        ) {

            console.log(
                "EDGE TRADER: User signed in."
            );

        }

        if (event === "SIGNED_OUT") {

            console.log(
                "EDGE TRADER: User signed out."
            );

        }

    }
);


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function getAuthError(error) {

    if (!error) {
        return "Something went wrong.";
    }

    const message =
        (error.message || "").toLowerCase();


    if (
        message.includes("invalid login credentials")
    ) {
        return "Incorrect email or password.";
    }


    if (
        message.includes("user already registered")
    ) {
        return "This email is already registered.";
    }


    if (
        message.includes("email not confirmed")
    ) {
        return "Please verify your email before signing in.";
    }


    if (
        message.includes("password should be at least")
    ) {
        return "Password is too short.";
    }


    if (
        message.includes("rate limit")
    ) {
        return "Too many requests. Please try again later.";
    }


    if (
        message.includes("network")
    ) {
        return "Network error. Please check your connection.";
    }


    return error.message || "Authentication failed.";
}


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            forgotPasswordModal.classList.contains("active")
        ) {
            closeForgotModal();
        }

    }
);
