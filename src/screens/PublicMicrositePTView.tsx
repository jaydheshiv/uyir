import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function PublicMicrositePTView() {
	const navigation = useNavigation();
	// Calendar logic
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentDate = now.getDate();
	const todayDate = currentDate;
	const [selectedDates, setSelectedDates] = useState([todayDate]);
	// Calculate current week (Monday-Sunday)
	const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Sunday as 7
	const weekStart = todayDate - dayOfWeek + 1;
	const weekEnd = weekStart + 6;
	// Book Session tab states
	const [_selectedDate, _setSelectedDate] = useState<number | null>(10); // default to 10th for demo
	const [selectedSlot, setSelectedSlot] = useState<string | null>('6:00 PM');
	const slots = ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];
	const [input, setInput] = useState('');
	const [showSheet, setShowSheet] = useState(false);
	const [selectedTab, setSelectedTab] = useState(0);
	const [entries, setEntries] = useState<string[]>([]);
	const [showTwinPreview, setShowTwinPreview] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
	const scrollRef = React.useRef<ScrollView>(null);
	const tabsScrollRef = React.useRef<ScrollView>(null);
	const isActive = input.trim().length > 0;
	const handleSend = () => {
		if (!isActive) return;
		setEntries([...entries, input]);
		setInput('');
		setTimeout(() => {
			scrollRef.current?.scrollToEnd({ animated: true });
		}, 100);
	};
	React.useEffect(() => {
		// Scroll tabs further right for extra spacing
		if (tabsScrollRef.current) {
			tabsScrollRef.current.scrollTo({ x: 2000, animated: true });
		}
	}, []);
	return (
		<View style={styles.container}>
			{/* Header with background image */}
			<View style={styles.headerBgContainer}>
				<Image
					source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }}
					style={styles.headerBg}
				/>
				<TouchableOpacity style={styles.backBtn}>
					<Ionicons name="arrow-back" size={28} color="#fff" />
				</TouchableOpacity>
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color="#fff" />
				</TouchableOpacity>
			</View>

			{/* Avatar and profile info */}
			<View style={styles.profileHeaderContainer}>
				<View style={styles.avatarStackedWrapper}>
					<Image
						source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }}
						style={styles.avatar}
					/>
				</View>
				<View style={styles.profileInfoContainer}>
					<View style={styles.profileNameRow}>
						<Text style={styles.profileName}>Sadhguru</Text>
						<TouchableOpacity style={styles.shareBtn}>
							<Ionicons name="share-social-outline" size={20} color="#7C4DFF" />
						</TouchableOpacity>
					</View>
					<Text style={[styles.profileDesc, styles.profileDescText]}>
						Welcome to my personal space !
					</Text>
					<Text style={[styles.profileSubs, styles.profileSubsText]}>
						<Text style={styles.boldText}>2k</Text> Subscribers
					</Text>
				</View>
			</View>

			{/* Tabs - horizontally scrollable and selectable */}
			<ScrollView
				ref={tabsScrollRef}
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.tabsRow}
				contentContainerStyle={styles.tabScrollContent}
			>
				{['Twin Window', 'About', 'Subscribe', 'Book Session'].map((tab, idx) => (
					<TouchableOpacity
						key={tab}
						style={[styles.tab, selectedTab === idx && styles.tabActive]}
						onPress={() => setSelectedTab(idx)}
					>
						<Text style={[styles.tabText, selectedTab === idx && styles.tabTextActive]}>{tab}</Text>
					</TouchableOpacity>
				))}
			</ScrollView>

			{/* Main content area */}
			<View style={styles.flexStartContainer}>
				{selectedTab === 1 ? (
					<ScrollView style={styles.contentScrollContainer} contentContainerStyle={styles.contentPadding}>
						<Text style={styles.sectionTitle}>About me</Text>
						<View style={styles.postCard}>
							<Text style={styles.postText}>
								Sadhguru, whose given name is Jaggi Vasudev, is an Indian yogi, mystic, and author. He was born on September 3, 1957, in Mysore, India. Sadhguru founded the Isha Foundation, a non-profit organization focused on yoga and humanitarian work. He is known for his teachings on yoga, spirituality, and social issues, and is the author of several books including "Inner Engineering: A Yogi's Guide to Joy".
							</Text>
						</View>
						<Text style={styles.videoSectionTitle}>View my knowledge base</Text>
						{/* Knowledge base cards */}
						<View style={styles.videoContainer}>
							<View style={styles.videoCard}>
								<Image source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }} style={styles.videoImage} />
								{/* White opacity overlay for locked card */}
								<View style={styles.videoOverlay}>
									<Ionicons name="lock-closed-outline" size={40} color="#7C4DFF" />
								</View>
								<View style={styles.videoBadgeLeft}>
									<Text style={styles.videoBadgeText}>Sun, Jun 3{`
`}8:40am</Text>
								</View>
								<View style={styles.videoBadgeRight}>
									<Text style={styles.videoBadgeText}>Subscribers only</Text>
								</View>
								<View style={styles.videoTitle}>
									<Text style={styles.videoTitleText}>Joyous & Renewed</Text>
								</View>
								<TouchableOpacity style={styles.videoJoinButton}>
									<Text style={styles.videoJoinButtonText}>Upgrade</Text>
								</TouchableOpacity>
							</View>
							<View style={styles.videoCard}>
								<Image source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }} style={styles.videoImage} />
								<View style={styles.videoBadgeLeft}>
									<Text style={styles.videoBadgeText}>Sat, Jun 2{`\n`}11:40am</Text>
								</View>
								<View style={styles.videoBadgeRight}>
									<Text style={styles.videoPurpleBadgeText}>Public</Text>
								</View>
								<View style={styles.videoTitle}>
									<Text style={styles.videoTitleText}>Empathetic & Inspired</Text>
								</View>
							</View>
						</View>
					</ScrollView>
				) : selectedTab === 0 ? (
					<>
						{showTwinPreview && selectedTab === 0 && (
							<>
								<View style={styles.floatingCard}>
									<Image
										source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }}
										style={styles.floatingCardImage}
									/>
									<View style={styles.floatingCardBadgeLeft}>
										<Ionicons name="volume-high-outline" size={24} color="#7C4DFF" />
									</View>
									<View style={styles.floatingCardBadgeRight}>
										<Ionicons name="refresh-outline" size={24} color="#7C4DFF" />
									</View>
								</View>
								<View style={styles.chatContentContainer}>
									<ScrollView
										style={styles.chatFlexContainer}
										contentContainerStyle={styles.chatHeaderContainer}
										showsVerticalScrollIndicator={true}
										ref={scrollRef}
									>
										{entries.length === 0 && (
											<View style={styles.chatUserContainer}>
												<Text style={[styles.chatPrompt, styles.chatUserName]}>What's been on your mind today?</Text>
												<View style={[styles.iconRow, styles.chatMessageRow]}>
													<Ionicons name="thumbs-up-outline" size={18} color="#8170FF" style={styles.chatIcon} />
													<Ionicons name="thumbs-down-outline" size={18} color="#8170FF" />
												</View>
											</View>
										)}
										{entries.map((entry, idx) => (
											<View key={idx} style={styles.chatMessageCard}>
												<Text style={styles.chatMessageText}>{entry}</Text>
											</View>
										))}
									</ScrollView>
									{/* Typing Card */}
									<View style={styles.typingCardRow}>
										<TextInput
											style={styles.typingInput}
											placeholder="Let your thoughts flow"
											placeholderTextColor="#868686"
											value={input}
											onChangeText={setInput}
											multiline
										/>
										<View style={styles.inputControlsRow}>
											<TouchableOpacity style={styles.micButton}>
												<Ionicons name="mic" size={22} color="#8170FF" />
											</TouchableOpacity>
											<TouchableOpacity style={styles.unlockBtnOutline} onPress={() => setShowSheet(true)}>
												<Text style={styles.unlockTextOutline}>Unlock live avatar</Text>
												<Ionicons name="lock-closed-outline" size={18} color="#8170FF" style={styles.chatIconSpacing} />
											</TouchableOpacity>
											<TouchableOpacity
												style={[styles.sendBtnFilled, isActive && styles.purpleBackground]}
												onPress={handleSend}
												activeOpacity={isActive ? 0.7 : 1}
												disabled={!isActive}
											>
												<Ionicons name="arrow-up" size={22} color="#fff" />
											</TouchableOpacity>
										</View>
									</View>
								</View>
							</>
						)}
						{!showTwinPreview && (
							<View style={[styles.chatCard]}>
								{/* ...existing code for chatCard... */}
								<ScrollView
									style={styles.chatFlexContainer}
									contentContainerStyle={styles.chatHeaderContainer}
									showsVerticalScrollIndicator={true}
									ref={scrollRef}
								>
									{entries.length === 0 && (
										<View style={styles.chatUserContainer}>
											<Text style={styles.chatPrompt}>How can I assist you?</Text>
											<View style={[styles.iconRow, styles.chatMessageRow]}>
												<Ionicons name="thumbs-up-outline" size={18} color="#7C4DFF" style={styles.chatIcon} />
												<Ionicons name="thumbs-down-outline" size={18} color="#7C4DFF" />
											</View>
										</View>
									)}
									{entries.map((entry, idx) => (
										<View key={idx} style={styles.messageCard}>
											<Text style={styles.chatMessageText}>{entry}</Text>
										</View>
									))}
								</ScrollView>
								{/* Typing Card */}
								<View style={styles.typingCardRow}>
									<TextInput
										style={styles.typingInput}
										placeholder="Let your thoughts flow"
										placeholderTextColor="#868686"
										value={input}
										onChangeText={setInput}
										multiline
									/>
									<View style={styles.inputControlsRow}>
										<TouchableOpacity style={styles.micButton}>
											<Ionicons name="mic" size={22} color="#8170FF" />
										</TouchableOpacity>
										<TouchableOpacity style={styles.unlockBtnOutline} onPress={() => setShowSheet(true)}>
											<Text style={styles.unlockTextOutline}>Unlock live avatar</Text>
											<Ionicons name="lock-closed-outline" size={18} color="#8170FF" style={styles.chatIconSpacing} />
										</TouchableOpacity>
										<TouchableOpacity
											style={[styles.sendBtnFilled, isActive && styles.purpleBackground]}
											onPress={handleSend}
											activeOpacity={isActive ? 0.7 : 1}
											disabled={!isActive}
										>
											<Ionicons name="arrow-up" size={22} color="#fff" />
										</TouchableOpacity>
									</View>
								</View>
							</View>
						)}
					</>
				) : selectedTab === 2 ? (
					<ScrollView style={styles.planScrollContainer}>
						<Text style={styles.planSectionTitle}>Choose A Plan</Text>
						{/* Weekly Plan */}
						<TouchableOpacity
							activeOpacity={0.8}
							onPress={() => setSelectedPlan('weekly')}
							style={[styles.planCard, selectedPlan === 'weekly' ? styles.planCardSelected : styles.planCardDefault]}>
							<View>
								<Text style={styles.subscriptionPlanTitle}>Weekly</Text>
								<Text style={styles.subscriptionPlanPrice}>$ 10.8 per week</Text>
							</View>
							<View style={styles.radioButton}>
								<View style={[styles.radioButtonInner, selectedPlan === 'weekly' ? styles.radioButtonSelected : styles.radioButtonUnselected]} />
							</View>
						</TouchableOpacity>
						{/* Monthly Plan */}
						<TouchableOpacity
							activeOpacity={0.8}
							onPress={() => setSelectedPlan('monthly')}
							style={[styles.planCard, selectedPlan === 'monthly' ? styles.planCardSelected : styles.planCardDefault]}>
							<View style={styles.planContent}>
								<Text style={styles.subscriptionPlanTitle}>Monthly</Text>
								<Text style={styles.subscriptionPlanPrice}>$ 25 per month</Text>
								<Text style={styles.subscriptionPlanFeatures}>Features :</Text>
								<Text style={styles.subscriptionPlanFeatureItem}>-Access all the memory capsules.</Text>
								<Text style={styles.subscriptionPlanFeatureItem}>-Get 50% off on bookes sessions.</Text>
								<Text style={styles.subscriptionPlanFeatureItem}>-Interaction with the twin avatar</Text>
							</View>
							<View style={styles.radioButton}>
								<View style={[styles.radioButtonInner, selectedPlan === 'monthly' ? styles.radioButtonSelected : styles.radioButtonUnselected]} />
							</View>
						</TouchableOpacity>
						{/* Annual Plan */}
						<TouchableOpacity
							activeOpacity={0.8}
							onPress={() => setSelectedPlan('annual')}
							style={[styles.planCard, selectedPlan === 'annual' ? styles.planCardSelected : styles.planCardDefault, styles.planCardMarginBottom]}>
							<View>
								<Text style={styles.subscriptionPlanTitle}>Annual</Text>
								<Text style={styles.subscriptionPlanPrice}>$ 200 per year</Text>
							</View>
							<View style={styles.radioButton}>
								<View style={[styles.radioButtonInner, selectedPlan === 'annual' ? styles.radioButtonSelected : styles.radioButtonUnselected]} />
							</View>
						</TouchableOpacity>
						{/* Subscribe Button */}
						<TouchableOpacity
							style={[styles.subscriptionButton, selectedPlan ? styles.purpleBackground : styles.disabledButton]}
							disabled={!selectedPlan}
						>
							<Text style={styles.subscriptionButtonText}>Subscribe</Text>
						</TouchableOpacity>
					</ScrollView>
				) : selectedTab === 3 ? (
					<ScrollView
						style={styles.dateContainer}
						contentContainerStyle={styles.dateContentContainer}
					>
						<Text style={styles.dateTitle}>Select a Date/Dates/Week</Text>
						<View style={styles.dateCard}>
							<Text style={styles.dateDescription}>Choose an available slot from the calendar below. All times are in your local timezone.</Text>
							<View style={styles.calendarContainer}>
								<View style={styles.calendarHeader}>
									<Text style={styles.calendarTitle}>{now.toLocaleString('default', { month: 'long' })} {currentYear}</Text>
									<View style={styles.calendarControls}>
										<Text style={styles.navArrowText}>{'<'}</Text>
										<Text style={styles.navArrowText}>{'>'}</Text>
									</View>
								</View>
								<View style={styles.calendarDaysRow}>
									{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
										<Text key={d} style={styles.calendarDayText}>{d}</Text>
									))}
								</View>
								{/* Calendar grid: 1-31 */}
								{[0, 1, 2, 3, 4].map(row => (
									<View key={row} style={styles.calendarWeekRow}>
										{Array.from({ length: 7 }, (_, i) => row * 7 + i + 1).filter(day => day <= 31).map(day => {
											let bg = '#fff';
											let color = '#323232ff';
											let textStyle = { fontSize: 15, color };
											let extraStyle = {};
											let disabled = true;
											// Only allow selection for current week after today
											if (day === todayDate) {
												textStyle = { fontSize: 15, color: '#000000ff' };
												extraStyle = { fontWeight: 'bold' };
												bg = '#006effff';
												disabled = true;
											} else if (day > todayDate && day <= weekEnd && day >= weekStart) {
												disabled = false;
												if (selectedDates.includes(day)) {
													textStyle = { fontSize: 15, color: '#fff' };
													extraStyle = { fontWeight: 'bold' };
													bg = '#8170FF';
												}
											}
											const handleDatePress = () => {
												if (disabled) return;
												setSelectedDates(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
											};
											return (
												<TouchableOpacity
													key={day}
													onPress={handleDatePress}
													style={[styles.calendarDateButton, { backgroundColor: bg }, disabled && styles.calendarDateDisabled]}
													disabled={disabled}
												>
													<Text style={[textStyle, extraStyle]}>{day}</Text>
												</TouchableOpacity>
											);
										})}
									</View>
								))}
							</View>
						</View>
						{/* Available Slots */}
						<Text style={styles.availableSlotsTitle}>Available Slots</Text>
						<View style={styles.slotsContainer}>
							{slots.map(slot => (
								<TouchableOpacity
									key={slot}
									onPress={() => setSelectedSlot(slot)}
									style={[styles.slotButton, selectedSlot === slot ? styles.slotButtonSelected : styles.slotButtonDefault]}
								>
									<Text style={[styles.slotText, selectedSlot === slot ? styles.slotTextSelected : styles.slotTextDefault]}>{slot}</Text>
								</TouchableOpacity>
							))}
						</View>
						{/* Your Selection */}
						<Text style={styles.selectionTitle}>Your Selection</Text>
						<View style={styles.selectionCard}>
							<View style={styles.selectionRow}>
								<Text style={styles.selectionLabel}>Session Duration</Text>
								<Text style={styles.selectionValue}>60 minutes</Text>
							</View>
							<View style={styles.selectionRow}>
								<Text style={styles.selectionLabel}>Number of Days</Text>
								<Text style={styles.selectionValue}>One Day</Text>
							</View>
							<View style={styles.selectionRow}>
								<Text style={styles.selectionLabel}>Total Cost</Text>
								<Text style={styles.selectionValue}>$5</Text>
							</View>
						</View>
						{/* Pay Now Button */}
						<TouchableOpacity style={[styles.subscriptionButton, styles.purpleBackground, styles.noMarginBottom]}>
							<Text style={styles.subscriptionButtonText}>Pay Now</Text>
						</TouchableOpacity>
					</ScrollView>
				) : null}
				{showTwinPreview && (
					<>
						<View style={styles.videoOverlayContainer}>
							<Image
								source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }}
								style={styles.videoOverlayImage}
							/>
							<View style={styles.videoControlLeft}>
								<Ionicons name="volume-high-outline" size={24} color="#7C4DFF" />
							</View>
							<View style={styles.videoControlRight}>
								<Ionicons name="refresh-outline" size={24} color="#7C4DFF" />
							</View>
						</View>
						<View style={styles.chatContentContainer}>
							<ScrollView
								style={styles.chatScrollContainer}
								contentContainerStyle={styles.chatScrollContentContainer}
								showsVerticalScrollIndicator={true}
								ref={scrollRef}
							>
								{entries.length === 0 && (
									<View style={styles.chatEmptyContainer}>
										<Text style={[styles.chatPrompt, styles.chatEmptyPrompt]}>What's been on your mind today?</Text>
										<View style={[styles.iconRow, styles.chatEmptyIconRow]}>
											<Ionicons name="thumbs-up-outline" size={18} color="#8170FF" style={styles.chatThumbIcon} />
											<Ionicons name="thumbs-down-outline" size={18} color="#8170FF" />
										</View>
									</View>
								)}
								{entries.map((entry, idx) => (
									<View key={idx} style={styles.messageCard}>
										<Text style={styles.chatMessageText}>{entry}</Text>
									</View>
								))}
							</ScrollView>
							{/* Typing Card */}
							<View style={styles.typingCardRow}>
								<TextInput
									style={styles.typingInput}
									placeholder="Let your thoughts flow"
									placeholderTextColor="#868686"
									value={input}
									onChangeText={setInput}
									multiline
								/>
								<View style={styles.inputControlsRow}>
									<TouchableOpacity style={styles.micButton}>
										<Ionicons name="mic" size={22} color="#8170FF" />
									</TouchableOpacity>
									<TouchableOpacity style={styles.unlockBtnOutline} onPress={() => setShowSheet(true)}>
										<Text style={styles.unlockTextOutline}>Unlock live avatar</Text>
										<Ionicons name="lock-closed-outline" size={18} color="#8170FF" style={styles.chatIconSpacing} />
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.sendBtnFilled, isActive && styles.purpleBackground]}
										onPress={handleSend}
										activeOpacity={isActive ? 0.7 : 1}
										disabled={!isActive}
									>
										<Ionicons name="arrow-up" size={22} color="#fff" />
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</>
				)}
			</View>

			{/* Bottom sheet modal */}
			{showSheet && (
				<View style={styles.sheetOverlay}>
					<View style={styles.sheetContainer}>
						<View style={styles.sheetHandle} />
						<View style={styles.sheetOptions}>
							<TouchableOpacity
								style={[styles.sheetOption, selectedPayment === 250 && styles.selectedBorder]}
								onPress={() => setSelectedPayment(250)}
							>
								<Text style={styles.sheetOptionText}>₹250 <Text style={styles.sheetOptionSub}>for 15 minutes</Text></Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.sheetOption, selectedPayment === 400 && styles.selectedBorder]}
								onPress={() => setSelectedPayment(400)}
							>
								<Text style={styles.sheetOptionText}>₹400 <Text style={styles.sheetOptionSub}>for 30 minutes</Text></Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.sheetOption, selectedPayment === 600 && styles.selectedBorder]}
								onPress={() => setSelectedPayment(600)}
							>
								<Text style={styles.sheetOptionText}>₹600 <Text style={styles.sheetOptionSub}>for 60 minutes</Text></Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							style={[styles.sheetPayBtn, !selectedPayment && styles.disabledButton]}
							onPress={() => { if (selectedPayment) { setShowSheet(false); setShowTwinPreview(true); } }}
							disabled={!selectedPayment}
						>
							<Text style={styles.sheetPayText}>Pay</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setShowSheet(false)}><Text style={styles.sheetCancelText}>Cancel</Text></TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	headerBgContainer: {
		width: '100%',
		height: 220,
		position: 'relative',
	},
	headerBg: {
		width: '100%',
		height: '100%',
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	backBtn: {
		position: 'absolute',
		top: 40,
		left: 18,
		backgroundColor: 'rgba(0,0,0,0.18)',
		borderRadius: 24,
		padding: 6,
	},
	profileStackedContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: -40,
		marginBottom: 0,
		paddingHorizontal: 18,
	},
	avatarStackedWrapper: {
		width: 80,
		height: 80,
		borderRadius: 40,
		overflow: 'hidden',
		borderWidth: 3,
		borderColor: '#fff',
		marginRight: 18,
		backgroundColor: '#eee',
	},
	avatar: {
		width: '100%',
		height: '100%',
		borderRadius: 40,
	},
	profileInfoStackedCentered: {
		flex: 1,
		justifyContent: 'center',
	},
	profileInfoRowCentered: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	profileName: {
		fontSize: 20,
		fontWeight: '700',
		color: '#222',
		marginRight: 8,
	},
	shareBtn: {
		padding: 6,
		borderRadius: 18,
		backgroundColor: '#F2F2F2',
	},
	profileDesc: {
		fontSize: 15,
		color: '#868686',
		marginTop: 0,
		marginBottom: 2,
	},
	profileSubs: {
		fontSize: 14,
		color: '#8170FF',
		fontWeight: '600',
		marginBottom: 0,
	},
	tabsRow: {
		paddingHorizontal: 15,
		marginBottom: 5,
		marginTop: -160,
	},
	tab: {
		paddingVertical: 8,
		paddingHorizontal: 18,
		borderRadius: 18,
		backgroundColor: '#F2F2F2',
		marginRight: 8,
	},
	tabActive: {
		backgroundColor: '#8170FF',
	},
	tabText: {
		fontSize: 15,
		color: '#868686',
		fontWeight: '600',
	},
	tabTextActive: {
		color: '#fff',
	},
	inputControlsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		marginTop: 8,
	},
	micButton: {
		width: 36,
		height: 36,
		backgroundColor: '#F2F2F2',
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 20,
	},
	unlockBtnOutline: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: '#8170FF',
		borderRadius: 24,
		paddingHorizontal: 18,
		paddingVertical: 6,
		backgroundColor: '#fff',
		marginHorizontal: 8,
	},
	unlockTextOutline: {
		color: '#8170FF',
		fontWeight: '600',
		fontSize: 14,
		marginRight: 0,
	},
	sendBtnFilled: {
		width: 36,
		height: 36,
		backgroundColor: '#8170FF',
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 20,
	},
	chatCard: {
		backgroundColor: '#F6F6F6',
		borderRadius: 24,
		marginHorizontal: 18,
		marginBottom: 0,
		marginTop: -160,
		padding: 1,
		flex: 0.9,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 10,
	},
	chatPrompt: {
		fontSize: 16,
		color: '#222',
		fontWeight: '600',
		marginBottom: 12,
		marginTop: 28,
		marginHorizontal: 25,
	},
	iconRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginTop: 0,
		marginHorizontal: 20,
	},
	typingCardRow: {
		backgroundColor: '#fff',
		borderRadius: 18,
		paddingVertical: 18,
		paddingHorizontal: 19,
		minHeight: 100,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		width: '100%',
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 4,
		elevation: 2,
		marginTop: 12,
	},
	typingInput: {
		color: '#868686',
		fontSize: 16,
		fontWeight: '400',
		marginBottom: 10,
		textAlign: 'left',
		width: '100%',
		minHeight: 36,
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderWidth: 0,
		borderColor: 'transparent',
	},
	sheetOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		top: 0,
		backgroundColor: 'rgba(0,0,0,0.18)',
		justifyContent: 'flex-end',
		zIndex: 99,
	},
	sheetContainer: {
		backgroundColor: '#fff',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 24,
		paddingTop: 25,
		paddingBottom: 32,
		minHeight: 400,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 8,
	},
	sheetHandle: {
		width: 48,
		height: 5,
		borderRadius: 3,
		backgroundColor: '#EDEDED',
		alignSelf: 'center',
		marginBottom: 10,
	},
	sheetOptions: {
		marginBottom: 24,
	},
	sheetOption: {
		borderWidth: 1.5,
		borderColor: '#7C4DFF',
		borderRadius: 28,
		paddingVertical: 12,
		paddingHorizontal: 15,
		marginBottom: 20,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	sheetOptionText: {
		color: '#7C4DFF',
		fontSize: 18,
		fontWeight: '700',
	},
	sheetOptionSub: {
		color: '#868686',
		fontSize: 15,
		fontWeight: '500',
	},
	sheetPayBtn: {
		backgroundColor: '#7C4DFF',
		borderRadius: 24,
		paddingVertical: 12,
		alignItems: 'center',
		marginBottom: 8,
	},
	sheetPayText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
	},
	sheetCancelBtn: {
		alignItems: 'center',
		marginTop: 0,
	},
	sheetCancelText: {
		color: '#868686',
		fontSize: 16,
		fontWeight: '500',
	},
	// New styles for fixing inline styles
	profileHeaderContainer: {
		alignItems: 'flex-start',
		marginTop: -40,
		marginBottom: 0,
		paddingHorizontal: 18,
	},
	profileInfoContainer: {
		alignItems: 'flex-start',
		marginTop: 2,
		width: '100%',
	},
	profileNameRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
	},
	profileDescText: {
		textAlign: 'left',
		marginTop: 2,
	},
	profileSubsText: {
		textAlign: 'left',
		marginTop: 2,
	},
	boldText: {
		fontWeight: 'bold',
	},
	avatarCenterContainer: {
		alignItems: 'center',
		paddingRight: 20,
	},
	contentMainContainer: {
		flex: 1,
		justifyContent: 'flex-start',
	},
	scrollContainer: {
		flex: 1,
		marginTop: -150,
	},
	scrollContentContainer: {
		paddingHorizontal: 18,
		paddingTop: 0,
	},
	sectionTitle: {
		fontWeight: '700',
		fontSize: 16,
		color: '#222',
		marginBottom: 8,
	},
	postCard: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 14,
		marginBottom: 18,
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	postText: {
		fontSize: 15,
		color: '#444',
		lineHeight: 22,
	},
	videoSectionTitle: {
		fontWeight: '700',
		fontSize: 15,
		color: '#222',
		marginBottom: 8,
	},
	videoContainer: {
		marginBottom: 16,
	},
	videoCard: {
		borderRadius: 18,
		overflow: 'hidden',
		marginBottom: 14,
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#e0e0e0',
		position: 'relative',
		height: 180,
	},
	videoImage: {
		width: '100%',
		height: 180,
		resizeMode: 'cover',
	},
	videoOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255,255,255,0.55)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	videoBadgeLeft: {
		position: 'absolute',
		top: 10,
		left: 14,
		backgroundColor: 'rgba(255,255,255,0.7)',
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	videoBadgeText: {
		color: '#868686',
		fontWeight: '600',
		fontSize: 13,
	},
	videoBadgeRight: {
		position: 'absolute',
		top: 10,
		right: 14,
		backgroundColor: 'rgba(255,255,255,0.7)',
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	videoPurpleBadgeText: {
		color: '#8170FF',
		fontWeight: '600',
		fontSize: 13,
	},
	videoTitle: {
		position: 'absolute',
		bottom: 12,
		left: 18,
	},
	videoTitleText: {
		color: '#b2e672',
		fontWeight: '700',
		fontSize: 15,
	},
	videoJoinButton: {
		position: 'absolute',
		bottom: 12,
		right: 18,
		backgroundColor: '#fff',
		borderRadius: 18,
		paddingHorizontal: 18,
		paddingVertical: 6,
		borderWidth: 1,
		borderColor: '#8170FF',
	},
	videoJoinButtonText: {
		color: '#8170FF',
		fontWeight: '700',
		fontSize: 15,
	},
	tabScrollContent: {
		alignItems: 'center',
		paddingRight: 20,
	},
	// Additional comprehensive styles for complex content
	flexContainer: {
		flex: 1,
	},
	flexStartContainer: {
		flex: 1,
		justifyContent: 'flex-start',
	},
	contentScrollContainer: {
		flex: 1,
		marginTop: -150,
	},
	contentPadding: {
		paddingHorizontal: 18,
		paddingTop: 0,
	},
	planContainer: {
		flex: 1,
		paddingHorizontal: 18,
		paddingTop: 24,
		marginTop: -195,
	},
	planTitle: {
		fontWeight: '700',
		fontSize: 17,
		color: '#222',
		marginBottom: 10,
	},
	planOptionWeekly: {
		borderWidth: 2,
		borderRadius: 18,
		padding: 18,
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	planOptionMonthly: {
		borderWidth: 2,
		borderRadius: 18,
		padding: 18,
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	planOptionAnnual: {
		borderWidth: 2,
		borderRadius: 18,
		padding: 18,
		marginBottom: 18,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	planOptionTitle: {
		fontWeight: '600',
		fontSize: 16,
		color: '#222',
	},
	planOptionSubtitle: {
		color: '#868686',
		fontSize: 15,
		marginTop: 2,
	},
	planOptionPrice: {
		color: '#222',
		fontSize: 15,
		marginTop: 8,
	},
	planOptionFeature: {
		color: '#222',
		fontSize: 15,
		marginTop: 2,
	},
	planRadioOuter: {
		width: 28,
		height: 28,
		borderRadius: 14,
		borderWidth: 2,
		borderColor: '#8170FF',
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	planRadioInner: {
		width: 18,
		height: 18,
		borderRadius: 9,
	},
	subscribeButton: {
		borderRadius: 18,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 1,
	},
	subscribeButtonText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 18,
	},
	// Book session styles
	bookSessionContainer: {
		flex: 1,
		marginTop: -170,
	},
	bookSessionScrollContent: {
		flexGrow: 1,
		paddingHorizontal: 18,
		paddingTop: 30,
		paddingBottom: 50,
		justifyContent: 'flex-start',
	},
	sessionTitle: {
		fontWeight: '700',
		fontSize: 16,
		color: '#222',
		marginBottom: 10,
		marginTop: -25,
	},
	sessionCard: {
		borderWidth: 1,
		borderColor: '#d1d1d1',
		borderRadius: 18,
		padding: 16,
		marginBottom: 18,
		backgroundColor: '#f7f7f7',
	},
	sessionCardHeader: {
		color: '#868686',
		fontSize: 14,
		marginBottom: 8,
	},
	sessionInfoCard: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		alignItems: 'center',
		marginBottom: 10,
	},
	sessionInfoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		marginBottom: 8,
	},
	sessionInfoTitle: {
		fontWeight: '600',
		fontSize: 15,
	},
	sessionInfoIcons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	sessionInfoIcon: {
		fontSize: 18,
	},
	sessionTimeRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 6,
	},
	sessionTimeText: {
		fontSize: 13,
		color: '#868686',
		width: 32,
		textAlign: 'center',
	},
	sessionCircle: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	timeSlotTitle: {
		fontWeight: '700',
		fontSize: 15,
		color: '#222',
		marginBottom: 10,
		marginTop: 5,
	},
	timeSlotContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 3,
		marginBottom: 4,
	},
	timeSlot: {
		borderWidth: 2,
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 18,
		marginRight: 10,
		marginBottom: 10,
	},
	timeSlotText: {
		fontWeight: '600',
		fontSize: 16,
	},
	summaryTitle: {
		fontWeight: '700',
		fontSize: 15,
		color: '#222',
		marginBottom: 10,
		marginTop: 5,
	},
	summaryCard: {
		borderWidth: 1,
		borderColor: '#d1d1d1',
		borderRadius: 18,
		padding: 16,
		marginBottom: 20,
		backgroundColor: '#fff',
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	summaryLabel: {
		color: '#868686',
		fontSize: 15,
	},
	summaryValue: {
		color: '#222',
		fontWeight: '600',
		fontSize: 15,
	},
	summaryRowTotal: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	bookButton: {
		backgroundColor: '#8170FF',
		borderRadius: 18,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 0,
	},
	bookButtonText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 18,
	},
	// Floating card styles
	floatingCard: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 365,
		marginHorizontal: 18,
		height: 150,
		borderRadius: 18,
		overflow: 'hidden',
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 8,
	},
	floatingCardImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	floatingCardBadgeLeft: {
		position: 'absolute',
		top: 10,
		left: 10,
	},
	floatingCardBadgeRight: {
		position: 'absolute',
		top: 10,
		right: 10,
	},
	// Chat content styles
	chatContentContainer: {
		minHeight: 310,
		flex: 0.5,
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		marginHorizontal: 18,
		marginBottom: 40,
	},
	chatFlexContainer: {
		flex: 1,
	},
	chatHeaderContainer: {
		alignItems: 'center',
		paddingVertical: 8,
	},
	chatUserContainer: {
		alignSelf: 'flex-start',
		marginLeft: 15,
	},
	chatUserName: {
		fontWeight: '600',
		fontSize: 17,
		color: '#3f3e3eff',
		marginTop: 18,
	},
	chatMessageRow: {
		justifyContent: 'flex-start',
		marginLeft: 35,
	},
	chatIcon: {
		marginRight: 8,
	},
	chatMessageCard: {
		backgroundColor: '#fcfcfcff',
		borderRadius: 10,
		padding: 12,
		marginBottom: 8,
		width: '95%',
		minHeight: 40,
		justifyContent: 'center',
		alignSelf: 'center',
	},
	chatMessageText: {
		fontSize: 15,
		color: '#222',
		textAlign: 'left',
	},
	chatIconSpacing: {
		marginLeft: 4,
	},
	purpleBackground: {
		backgroundColor: '#8170FF',
	},
	selectedBorder: {
		borderColor: '#8170FF',
		backgroundColor: '#F6F3FF',
	},
	disabledButton: {
		backgroundColor: '#C7BFFF',
	},
	// Subscription plan styles
	planCard: {
		borderWidth: 2,
		borderRadius: 18,
		padding: 18,
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	planCardDefault: {
		borderColor: '#e0e0e0',
		backgroundColor: '#fff',
	},
	planCardSelected: {
		borderColor: '#8170FF',
		backgroundColor: '#F6F3FF',
	},
	planContent: {
		flex: 1,
	},
	subscriptionPlanTitle: {
		fontWeight: '600',
		fontSize: 16,
		color: '#222',
	},
	subscriptionPlanPrice: {
		color: '#868686',
		fontSize: 15,
		marginTop: 2,
	},
	subscriptionPlanFeatures: {
		color: '#222',
		fontSize: 15,
		marginTop: 8,
	},
	subscriptionPlanFeatureItem: {
		color: '#222',
		fontSize: 15,
		marginTop: 2,
	},
	radioButton: {
		width: 28,
		height: 28,
		borderRadius: 14,
		borderWidth: 2,
		borderColor: '#8170FF',
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioButtonInner: {
		width: 18,
		height: 18,
		borderRadius: 9,
	},
	radioButtonSelected: {
		backgroundColor: '#8170FF',
	},
	radioButtonUnselected: {
		backgroundColor: '#fff',
	},
	subscriptionButton: {
		borderRadius: 18,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 1,
	},
	subscriptionButtonText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 18,
	},
	// Date selection styles
	dateContainer: {
		flex: 1,
		marginTop: -170,
	},
	dateContentContainer: {
		flexGrow: 1,
		paddingHorizontal: 18,
		paddingTop: 30,
		paddingBottom: 50,
		justifyContent: 'flex-start',
	},
	dateTitle: {
		fontWeight: '700',
		fontSize: 16,
		color: '#222',
		marginBottom: 10,
		marginTop: -25,
	},
	dateCard: {
		borderWidth: 1,
		borderColor: '#d1d1d1',
		borderRadius: 18,
		padding: 16,
		marginBottom: 18,
		backgroundColor: '#f7f7f7',
	},
	dateDescription: {
		color: '#868686',
		fontSize: 14,
		marginBottom: 8,
	},
	calendarContainer: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		alignItems: 'center',
		marginBottom: 10,
	},
	calendarHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		marginBottom: 8,
	},
	calendarTitle: {
		fontWeight: '600',
		fontSize: 15,
	},
	calendarControls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	// Video overlay styles
	videoOverlayContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 365,
		marginHorizontal: 18,
		height: 150,
		borderRadius: 18,
		overflow: 'hidden',
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 8,
	},
	videoOverlayImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	videoControlLeft: {
		position: 'absolute',
		top: 10,
		left: 10,
	},
	videoControlRight: {
		position: 'absolute',
		top: 10,
		right: 10,
	},
	chatScrollContainer: {
		flex: 1,
	},
	chatScrollContentContainer: {
		alignItems: 'center',
		paddingVertical: 8,
	},
	chatEmptyContainer: {
		alignSelf: 'flex-start',
		marginLeft: 15,
	},
	chatEmptyPrompt: {
		fontWeight: '600',
		fontSize: 17,
		color: '#3f3e3eff',
		marginTop: 18,
	},
	chatEmptyIconRow: {
		justifyContent: 'flex-start',
		marginLeft: 35,
	},
	chatThumbIcon: {
		marginRight: 8,
	},
	messageCard: {
		backgroundColor: '#fcfcfcff',
		borderRadius: 10,
		padding: 12,
		marginBottom: 8,
		width: '95%',
		minHeight: 40,
		justifyContent: 'center',
		alignSelf: 'center',
	},
	// Plan selection styles
	planScrollContainer: {
		flex: 1,
		paddingHorizontal: 18,
		paddingTop: 24,
		marginTop: -195,
	},
	planSectionTitle: {
		fontWeight: '700',
		fontSize: 17,
		color: '#222',
		marginBottom: 10,
	},
	planCardMarginBottom: {
		marginBottom: 18,
	},
	// Calendar navigation styles
	navArrowText: {
		fontSize: 18,
	},
	// Calendar day styles
	calendarDaysRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 6,
	},
	calendarDayText: {
		fontSize: 13,
		color: '#868686',
		width: 32,
		textAlign: 'center',
	},
	calendarWeekRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 6,
	},
	calendarDateButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	calendarDateDisabled: {
		opacity: 0.4,
	},
	// Booking section styles
	availableSlotsTitle: {
		fontWeight: '700',
		fontSize: 15,
		color: '#222',
		marginBottom: 10,
		marginTop: 5,
	},
	slotsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 3,
		marginBottom: 4,
	},
	slotText: {
		fontWeight: '600',
		fontSize: 16,
	},
	slotTextSelected: {
		color: '#fff',
	},
	slotTextDefault: {
		color: '#222',
	},
	selectionTitle: {
		fontWeight: '700',
		fontSize: 15,
		color: '#222',
		marginBottom: 10,
		marginTop: 5,
	},
	selectionCard: {
		borderWidth: 1,
		borderColor: '#d1d1d1',
		borderRadius: 18,
		padding: 16,
		marginBottom: 20,
		backgroundColor: '#fff',
	},
	selectionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	selectionLabel: {
		color: '#868686',
		fontSize: 15,
	},
	selectionValue: {
		color: '#222',
		fontWeight: '600',
		fontSize: 15,
	},
	// Slot button styles
	slotButton: {
		borderWidth: 2,
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 18,
		marginRight: 10,
		marginBottom: 10,
	},
	slotButtonDefault: {
		borderColor: '#d1d1d1',
		backgroundColor: '#fff',
	},
	slotButtonSelected: {
		borderColor: '#8170FF',
		backgroundColor: '#8170FF',
	},
	// Additional margin utilities
	noMarginBottom: {
		marginBottom: 0,
	},
});
