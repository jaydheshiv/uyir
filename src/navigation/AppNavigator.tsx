import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Animated } from 'react-native';
import AccountGranted from '../screens/AccountGranted';
import ApprovalStatusChecker from '../screens/ApprovalStatusChecker';
import ContentVisibility from '../screens/ContentVisibility'; // Add ContentVisibility import
import CreateAccount from '../screens/CreateAccount';
import CreateAvatar1 from '../screens/CreateAvatar1';
import CvGeneral from '../screens/CvGeneral'; // Add CvGeneral import
import CvKnowledgeBase from '../screens/CvKnowledgeBase'; // Add CvKnowledgeBase import
import CvKnowledgeBase1 from '../screens/CvKnowledgeBase1'; // Add CvKnowledgeBase1 import
import DefaultAvatar from '../screens/DefaultAvatar';
import GrantedScreen from '../screens/GrantedScreen';
import GuardianGrantedScreen from '../screens/GuardianGrantedScreen';
import KnowledgeBase from '../screens/KnowledgeBase'; // Add KnowledgeBase import
import KnowledgeBaseFolder from '../screens/KnowledgeBaseFolder'; // Add KnowledgeBaseFolder import
import NotGuardianGrantedScreen from '../screens/NotGuardianGrantedScreen';
import PublicMicrositePTView from '../screens/PublicMicrositePTView';
import SessionSettings from '../screens/SessionSettings'; // Add SessionSettings import

// Import screens
import OnboardingScreen1 from '../screens/OnboardingScreen1';
import SplashScreen from '../screens/SplashScreen';
import Walkthrough1 from '../screens/Walkthrough1';
import Walkthrough2 from '../screens/Walkthrough2';
import Walkthrough3 from '../screens/Walkthrough3';
// import LoginScreen from '../screens/LoginScreen';
// import SignUpScreen from '../screens/SignUpScreen';
import About from '../screens/About';
import Avatar from '../screens/Avatar';
import Avatarhome1 from '../screens/Avatarhome1';
import BasicDetails from '../screens/BasicDetails';
import ChoosePaymentMethod from '../screens/ChoosePaymentMethod'; // Add this import
import Connections from '../screens/Connections'; // Add this import
import Connections1 from '../screens/Connections1'; // Add this import at the top
import CreateAvatar3 from '../screens/CreateAvatar3'; // Add this import
import DebitCreditCard from '../screens/DebitCreditCard'; // Add this import
import DeleteAccount from '../screens/DeleteAccount'; // Added import for DeleteAccount
import Editing from '../screens/Editing'; // Add Editing screen import
import EditProfile from '../screens/EditProfile';
import FeedbackPage from '../screens/FeedbackPage';
import GuardianConsent from '../screens/GuardianConsent';
import Invite from '../screens/Invite';
import Language from '../screens/Language';
import LetUsKnowYou2 from '../screens/LetUsKnowYou2';
import MicrositePTView from '../screens/MicrositePTView';
import OTPVerificationPhoneScreen from '../screens/OTPVerificationPhoneScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import OTPVerificationScreenlogin from '../screens/OTPVerificationScreenlogin';
import PasswordChange from '../screens/PasswordChange';
import PaymentSuccessful from '../screens/PaymentSuccessful'; // Add this import
import PrivacyPolicy from '../screens/PrivacyPolicy';
import ProfileScreen from '../screens/ProfileScreen'; // Add this import
import ProfileSettings from '../screens/ProfileSettings'; // Add ProfileSettings import
import ProfileStatusScreen from '../screens/ProfileStatus'; // Add this import
import ProLite from '../screens/ProLite';
import SeePlans from '../screens/SeePlans';
import SignupFlow from '../screens/SignupFlow';
import SubscriptionSettings from '../screens/SubscriptionSettings'; // Add SubscriptionSettings import
import SupportPage from '../screens/SupportPage';
import SupportPage1 from '../screens/SupportPage1';
import SupportPage2 from '../screens/SupportPage2';
import TotalDonations from '../screens/TotalDonations';
import TotalSubscribers from '../screens/TotalSubscribers';
import UpComingSessions from '../screens/UpComingSessions';
import Upload from '../screens/Upload';
import Visualizations from '../screens/Visualizations';

export type RootStackParamList = {
	Splash: undefined;
	Walkthrough1: undefined;
	Walkthrough2: undefined;
	Walkthrough3: undefined;
	OnboardingScreen1: undefined;
	LoginFlow: undefined;
	Home: undefined;
	BasicDetails: undefined;
	GuardianConsent: undefined;
	OTPVerificationScreen: { code: string; email?: string; mobile?: string };
	OTPVerificationScreenlogin: { code?: string; email?: string; mobile?: string };
	OTPVerificationPhoneScreen: { code: string; mobile?: string };
	SignupFlow: undefined;
	GrantedScreen: undefined;
	GuardianGrantedScreen: undefined;
	NotGuardianGrantedScreen: undefined;
	ApprovalStatusChecker: { guardianEmail: string };
	CreateAvatar1: undefined;
	CreateAccount: undefined;
	AddYourVoice: undefined;
	AccountGranted: undefined;
	DefaultAvatar: undefined;
	Learnmore: undefined;
	Avatarhome1: undefined;
	Visualizations: undefined;
	Connections: undefined; // Add this line
	Connections1: undefined; // Add this line
	Editing: undefined; // Add Editing screen to stack param list
	ProfileScreen: undefined; // Add this line
	ProfileStatus: undefined; // Add this line
	Discoverprotier: undefined; // Add this line
	SeePlans: undefined; // Add this line
	ProLite: undefined; // Add this line
	ChoosePaymentMethod: undefined; // Add this line
	DebitCreditCard: undefined; // Add this line
	PaymentSuccessful: undefined; // Add this line
	CreateAvatar3: undefined; // Add this line
	LetUsKnowYou: undefined; // Add this line
	UploadContent: undefined; // Added UploadContent screen
	LetUsKnowYou2: undefined; // Added LetUsKnowYou2 screen
	TermsAndConditions: undefined; // Added TermsAndConditions screen
	MicrositePTView: undefined;
	TotalSubscribers: undefined;
	TotalDonations: undefined;
	UpComingSessions: undefined;
	Upload: undefined;
	Invite: undefined; // Added Invite screen
	EditProfile: undefined; // Add this line
	Avatar: undefined; // Add this line
	Language: undefined;
	FeedbackPage: undefined;
	PrivacyPolicy: undefined;
	About: undefined;
	DeleteAccount: undefined; // Added DeleteAccount screen
	SupportPage: undefined;
	SupportPage1: undefined;
	SupportPage2: undefined;
	PasswordChange: undefined;
	PublicMicrositePTView: undefined;
	ProfileSettings: undefined; // Add ProfileSettings to stack param list
	SubscriptionSettings: undefined; // Add SubscriptionSettings to stack param list
	SessionSettings: undefined; // Add SessionSettings to stack param list
	KnowledgeBase: undefined; // Add KnowledgeBase to stack param list
	ContentVisibility: undefined; // Add ContentVisibility to stack param list
	CvKnowledgeBase: undefined; // Add CvKnowledgeBase to stack param list
	CvGeneral: undefined; // Add CvGeneral to stack param list
	CvKnowledgeBase1: undefined; // Add CvKnowledgeBase1 to stack param list
	KnowledgeBaseFolder: undefined; // Add KnowledgeBaseFolder to stack param list

};

const Stack = createStackNavigator<RootStackParamList>();

const fadeTransition = {
	cardStyleInterpolator: ({ current }: { current: { progress: Animated.AnimatedInterpolation<number> } }) => ({
		cardStyle: {
			opacity: current.progress,
		},
	}),
};



import LoginFlow from '../screens/LoginFlow';


import UploadContent from '../screens/UploadContent';

import TermsAndConditions from '../screens/TermsAndConditions';

const AppNavigator: React.FC = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="Splash"
				screenOptions={{
					headerShown: false,
					gestureEnabled: true,
				}}
			>
				<Stack.Screen name="Splash" component={SplashScreen} />
				<Stack.Screen name="Walkthrough1" component={Walkthrough1} options={fadeTransition} />
				<Stack.Screen name="Walkthrough2" component={Walkthrough2} options={fadeTransition} />
				<Stack.Screen name="Walkthrough3" component={Walkthrough3} options={fadeTransition} />
				<Stack.Screen name="OnboardingScreen1" component={OnboardingScreen1} />
				<Stack.Screen name="LoginFlow" component={LoginFlow} />
				{/* <Stack.Screen name="Login" component={LoginScreen} /> */}
				{/* <Stack.Screen name="SignUp" component={SignUpScreen} /> */}
				<Stack.Screen name="Home" component={Avatarhome1} />
				<Stack.Screen name="BasicDetails" component={BasicDetails} />
				<Stack.Screen name="GuardianConsent" component={GuardianConsent} />
				<Stack.Screen name="SignupFlow" component={SignupFlow} />
				<Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
				<Stack.Screen name="OTPVerificationPhoneScreen" component={OTPVerificationPhoneScreen} />
				<Stack.Screen name="OTPVerificationScreenlogin" component={OTPVerificationScreenlogin} />
				<Stack.Screen name="GrantedScreen" component={GrantedScreen} />
				<Stack.Screen name="CreateAvatar1" component={CreateAvatar1} />
				<Stack.Screen name="CreateAccount" component={CreateAccount} />
				<Stack.Screen name="GuardianGrantedScreen" component={GuardianGrantedScreen} />
				<Stack.Screen name="NotGuardianGrantedScreen" component={NotGuardianGrantedScreen} />
				<Stack.Screen name="ApprovalStatusChecker" component={ApprovalStatusChecker} />
				<Stack.Screen name="AccountGranted" component={AccountGranted} />
				<Stack.Screen name="DefaultAvatar" component={DefaultAvatar} />
				<Stack.Screen name="Learnmore" component={require('../screens/Learnmore').default} />
				<Stack.Screen name="Avatarhome1" component={Avatarhome1} />
				<Stack.Screen name="Visualizations" component={Visualizations} />
				<Stack.Screen name="Connections" component={Connections} options={{ presentation: 'modal' }} />
				<Stack.Screen name="Connections1" component={Connections1} options={{ presentation: 'modal' }} />
				<Stack.Screen name="ProfileScreen" component={ProfileScreen} />
				<Stack.Screen name="ProfileStatus" component={ProfileStatusScreen} />
				<Stack.Screen name="Discoverprotier" component={require('../screens/Discoverprotier').default} />
				<Stack.Screen name="SeePlans" component={SeePlans} />
				<Stack.Screen name="Editing" component={Editing} />
				<Stack.Screen name="ProLite" component={ProLite} />
				<Stack.Screen name="ChoosePaymentMethod" component={ChoosePaymentMethod} />
				<Stack.Screen name="DebitCreditCard" component={DebitCreditCard} />
				<Stack.Screen name="PaymentSuccessful" component={PaymentSuccessful} />
				<Stack.Screen name="CreateAvatar3" component={CreateAvatar3} />
				<Stack.Screen name="LetUsKnowYou" component={require('../screens/LetUsKnowYou').default} />
				<Stack.Screen name="UploadContent" component={UploadContent} />
				<Stack.Screen name="LetUsKnowYou2" component={LetUsKnowYou2} />
				<Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
				<Stack.Screen name="MicrositePTView" component={MicrositePTView} />
				<Stack.Screen name="TotalSubscribers" component={TotalSubscribers} />
				<Stack.Screen name="TotalDonations" component={TotalDonations} />
				<Stack.Screen name="UpComingSessions" component={UpComingSessions} />
				<Stack.Screen name="Upload" component={Upload} />
				<Stack.Screen name="Invite" component={Invite} />
				<Stack.Screen name="EditProfile" component={EditProfile} />
				<Stack.Screen name="Avatar" component={Avatar} />
				<Stack.Screen name="DeleteAccount" component={DeleteAccount} />
				<Stack.Screen name="SupportPage" component={SupportPage} />
				<Stack.Screen name="SupportPage1" component={SupportPage1} />
				<Stack.Screen name="SupportPage2" component={SupportPage2} />
				<Stack.Screen name="PasswordChange" component={PasswordChange} />
				<Stack.Screen name="Language" component={Language} />
				<Stack.Screen name="FeedbackPage" component={FeedbackPage} />
				<Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
				<Stack.Screen name="About" component={About} />
				<Stack.Screen name="PublicMicrositePTView" component={PublicMicrositePTView} />
				<Stack.Screen name="ProfileSettings" component={ProfileSettings} />
				<Stack.Screen name="SubscriptionSettings" component={SubscriptionSettings} />
				<Stack.Screen name="SessionSettings" component={SessionSettings} />
				<Stack.Screen name="KnowledgeBase" component={KnowledgeBase} />
				<Stack.Screen name="ContentVisibility" component={ContentVisibility} />
				<Stack.Screen name="CvKnowledgeBase" component={CvKnowledgeBase} />
				<Stack.Screen name="CvKnowledgeBase1" component={CvKnowledgeBase1} />
				<Stack.Screen name="KnowledgeBaseFolder" component={KnowledgeBaseFolder} />
				<Stack.Screen name="CvGeneral" component={CvGeneral} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default AppNavigator;
