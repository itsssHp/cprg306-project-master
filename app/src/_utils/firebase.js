// Import the necessary functions from Firebase SDK
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GithubAuthProvider, // Import the provider directly without `new`
} from "firebase/auth";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Authentication and Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Firestore collections
export const commentsCollection = collection(db, "comments");

// GitHub authentication provider
const githubProvider = new GithubAuthProvider();

// Function to sign in with GitHub
export const signInWithGitHub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider); // Use signInWithPopup
    console.log("Signed in as:", result.user.displayName);
  } catch (error) {
    console.error("Error signing in with GitHub:", error);
  }
};

// Function to sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("Signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// Function to fetch comments for a specific movie
export const fetchComments = async (movieId) => {
  try {
    const q = query(
      commentsCollection,
      where("movieId", "==", movieId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching comments: ", error);
    return []; // Return an empty array if an error occurs
  }
};

// Function to post a new comment to Firestore
export const postComment = async (movieId, commentText) => {
  try {
    const user = await getCurrentUser(); // Get the current logged-in user

    if (!user) {
      alert("You must be logged in to post a comment.");
      return; // Don't post the comment if the user is not logged in
    }

    // Proceed with posting the comment if the user is authenticated
    await addDoc(commentsCollection, {
      movieId,
      userId: user.uid, // Save the user's ID in the comment
      comment: commentText,
      timestamp: new Date(),
    });
    console.log("Comment posted successfully");
  } catch (error) {
    console.error("Error posting comment: ", error);
  }
};

// Function to get the currently authenticated user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (
        user &&
        user.providerData.some(
          (provider) => provider.providerId === "github.com"
        )
      ) {
        resolve(user); // Only resolve for GitHub users
      } else {
        reject("No GitHub user signed in");
      }
    });
  });
};
