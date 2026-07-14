import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Screen =
  | 'welcome'
  | 'identity_auth' // NEW: Enter student ID & university email
  | 'create_pin' // NEW: Setup 6-digit passcode
  | 'identity_proofing' // NEW: Input Passport, National ID, Grad Date
  | 'verifying' // NEW: Loading spinner status panel
  | 'wallet'
  | 'offer'
  | 'success'
  | 'credential'
  | 'share'
  | 'verification'
  | 'receipt'
  | 'history'
  | 'settings'

type ShareFields = {
  degree: boolean;
  major: boolean;
  graduation: boolean;
  gpa: boolean;
  standing: boolean;
};

type HistoryEvent = {
  id: string;
  type: 'share' | 'issue';
  title: string;
  subtitle: string;
  targetScreen: Screen;
  sharedFields?: ShareFields;
};

const colors = {
  bg: '#FAF7F5',
  red: '#CC1919',
  redDark: '#5C0B0B',
  redMid: '#8F1212',
  ink: '#1C1918',
  muted: '#6B6461',
  border: '#EAE2DE',
  card: '#FFFFFF',
  softRed: '#F7E3E1',
  sand: '#EFE7DA',
  brown: '#8A6A2E',
  green: '#1E7F4C',
  mint: '#8CF0B4',
  blueInk: '#00112C',
  blueMuted: '#4D607A',
  hidden: '#B9827C',
};

const copy = {
  student: 'Erik Criston',
  studentDetail: 'Erik Christina',
  id: '6412345',
  degree: 'Bachelor of Science',
  major: 'Computer Science',
  majorFull: 'Computer Science · Distinction',
  graduationDisplay: '15 Jun 2023',
  graduationISO: '2023-06-15',
  gpa: '3.75',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('create_pin');
  const [shareFields, setShareFields] = useState({
    degree: true,
    major: true,
    graduation: true,
    gpa: false,
    standing: false,
  });
  const [history, setHistory] = useState<HistoryEvent[]>([
    {
      id: 'initial-issue',
      type: 'issue',
      title: 'Issued: Education Transcript VC',
      subtitle: 'From AU Registrar',
      targetScreen: 'credential',
    },
  ]);

  const content = useMemo(() => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen onSignIn={() => setScreen('wallet')} />;
      case 'identity_auth':
        return <IdentityAuthScreen go={setScreen} />;
      case 'create_pin':
        return <CreatePinScreen go={setScreen} />;
      case 'identity_proofing':
        return <IdentityProofingScreen go={setScreen} />;
      case 'verifying':
        return <VerifyingScreen go={setScreen} />;
      case 'wallet':
        return <WalletScreen go={setScreen} />;
      case 'offer':
        return <OfferScreen go={setScreen} />;
      case 'success':
        return <SuccessScreen go={setScreen} />;
      case 'credential':
        return <CredentialScreen go={setScreen} />;
      case 'share':
        return (
          <ShareScreen
            fields={shareFields}
            setFields={setShareFields}
            go={setScreen}
            onShare={() => {
              const sharedCount = Object.values(shareFields).filter(Boolean).length;
              const newHistoryEvent: HistoryEvent = {
                id: `share-${Date.now()}`,
                type: 'share',
                title: 'Shared proof with Employer A',
                subtitle: `Education Transcript VC · ${sharedCount} field${sharedCount === 1 ? '' : 's'}`,
                targetScreen: 'receipt',
                sharedFields: { ...shareFields },
              };
              setHistory(prevHistory => [newHistoryEvent, ...prevHistory]);
              setScreen('verification');
            }}
          />
        );
      case 'verification':
        return <VerificationScreen go={setScreen} />;
      case 'receipt':
        return <ReceiptScreen go={setScreen} />;
      case 'history':
        return <HistoryScreen go={setScreen} history={history} />;
      case 'settings':
        return <SettingsScreen go={setScreen} />;
    }
  }, [screen, shareFields]);

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.phone}>{content}</View>
    </SafeAreaView>
  );
}

function WelcomeScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <View style={styles.screen}>
      <StatusChrome />
      <View style={styles.logoGlow} />
      <View style={styles.logoContainer}>
        <Image source={require('./assets/Assumption_University_of_Thailand_(logo).png')} style={styles.welcomeLogo} />
      </View>
      <View style={styles.welcomeCopy}>
        <Text style={styles.welcomeTitle}>AU Wallet</Text>
        <Text style={[styles.eyebrowCentered, { marginTop: 4 }]}>ASSUMPTION UNIVERSITY</Text>
        <Text style={styles.centerBody}>
          Securely receive, store, and share verified university certificates.
        </Text>
      </View>
      <View style={styles.loginPanel}>
        <Text style={styles.panelHeading}>Continue as student</Text>
        <PrimaryButton label="Sign in with AU Account" onPress={onSignIn} />
      </View>
    </View>
  );
}

// 1. Enter ID & Email to continue
function IdentityAuthScreen({ go }: { go: (screen: Screen) => void }) {
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');

  return (
    <View style={styles.screen}>
      <StatusChrome />
      <BackHeader title="Log In" subtitle="Step 2 of 3" onBack={() => go('create_pin')} />
      <View style={styles.welcomeCopy}>
        <Text style={styles.welcomeTitle}>Verify Account</Text>
        <Text style={styles.centerBody}>Enter your student credentials to log into your portal.</Text>
      </View>
      <View style={[styles.infoPanel, { marginHorizontal: 20, marginTop: 40, gap: 12 }]}>
        <Text style={styles.panelHeading}>Student ID</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 6412345"
          placeholderTextColor={colors.muted}
          value={studentId}
          onChangeText={setStudentId}
        />
        <Text style={styles.panelHeading}>University Email</Text>
        <TextInput
          style={styles.input}
          placeholder="student@u.au.edu"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.actionStack}>
        <PrimaryButton label="Next" onPress={() => go('identity_proofing')} />
      </View>
    </View>
  );
}

// 2. Create local 6-digit PIN
function CreatePinScreen({ go }: { go: (screen: Screen) => void }) {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(true);

  const handlePinChange = (text: string) => {
    setError(false);
    if (step === 'create') {
      setPin(text);
    } else {
      setConfirmPin(text);
      if (text.length === 6) {
        if (pin !== text) {
          setError(true);
          setTimeout(() => {
            setPin('');
            setConfirmPin('');
            setStep('create');
            setError(false);
          }, 1000);
        }
      }
    }
  };

  const handleNext = () => {
    setError(false);
    if (step === 'create') {
      setStep('confirm');
    } else if (pin === confirmPin) {
      go('identity_auth');
    } else {
      setError(true);
    }
  };

  const currentPin = step === 'create' ? pin : confirmPin;
  const title = step === 'create' ? 'Create Wallet PIN' : 'Confirm Wallet PIN';
  const subtitle = error ? 'PINs did not match. Try again.' : 'Set a local code to securely lock your credentials on this phone.';

  return (
    <View style={styles.screen}>
      <StatusChrome />
      <TextInput style={styles.pinInputHidden} value={currentPin} onChangeText={handlePinChange} maxLength={6} keyboardType="numeric" autoFocus />
      <Header eyebrow="Step 1 of 3" title="Create Account" />
      <ScrollView contentContainerStyle={styles.detailContent}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.welcomeTitle}>{title}</Text>
          <Text style={[styles.centerBody, error && { color: colors.red }]}>{subtitle}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 60 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[styles.pinBox, error && { borderColor: colors.red }]}>
              {currentPin[i] && <View style={styles.pinDot} />}
            </View>
          ))}
        </View>
        <View style={{ marginHorizontal: 20, marginTop: 40 }}>
          <FieldSwitch label="Use Face ID" code="Enable biometrics for faster login" value={useBiometrics} onPress={() => setUseBiometrics(v => !v)} />
        </View>
      </ScrollView>
      <View style={styles.actionStack}>
        <PrimaryButton label={step === 'create' ? 'Create PIN' : 'Confirm PIN'} onPress={handleNext} />
      </View>
    </View>
  );
}

// 3. Input Passport & Official details
function IdentityProofingScreen({ go }: { go: (screen: Screen) => void }) {
  const [passport, setPassport] = useState('');
  const [nationalId, setNationalId] = useState('');

  return (
    <View style={styles.screen}>
      <StatusChrome />
      <BackHeader title="Personal Details" subtitle="Step 3 of 3" onBack={() => go('identity_auth')} />
      <ScrollView contentContainerStyle={styles.detailContent}>
        <View style={[styles.infoPanel, { gap: 8 }]}>
          <Text style={styles.switchLabel}>Full Name (as per Passport)</Text>
          <View style={[styles.settingRow, { backgroundColor: colors.bg }]}><Text>{copy.student}</Text></View>

          <Text style={styles.switchLabel}>Passport Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter passport number"
            placeholderTextColor={colors.muted}
            value={passport}
            onChangeText={setPassport}
          />

          <Text style={styles.switchLabel}>National ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 13-digit ID"
            placeholderTextColor={colors.muted}
            value={nationalId}
            onChangeText={setNationalId}
            keyboardType="numeric"
            maxLength={13}
          />

          <Text style={styles.switchLabel}>Expected Graduation Date</Text>
          <View style={[styles.settingRow, { backgroundColor: colors.bg }]}><Text>{copy.graduationDisplay}</Text></View>
        </View>
      </ScrollView>
      <View style={styles.actionStack}>
        <PrimaryButton label="Submit to Registrar" onPress={() => go('verifying')} />
      </View>
    </View>
  );
}

// 4. Loading State (Issuer Database Verification Loop)
function VerifyingScreen({ go }: { go: (screen: Screen) => void }) {
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.screen}>
      <StatusChrome />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <Text style={[styles.welcomeTitle, { fontSize: 22 }]}>Verification in Progress</Text>
        <Text style={[styles.centerBody, { marginBottom: 40 }]}>
          Assumption University systems are cross-referencing your submitted documentation...
        </Text>
        <View style={styles.successHalo}>
          <View style={[styles.haloOuter, { backgroundColor: colors.sand }]} />
          <View style={[styles.haloMiddle, { backgroundColor: '#E8DBC9' }]} />
          <Animated.View style={[styles.haloCore, { backgroundColor: colors.brown, transform: [{ rotate: spin }] }]}>
            <Text style={{ fontSize: 32 }}>⏳</Text>
          </Animated.View>
        </View>
        <View style={styles.actionStack}>
          <PrimaryButton label="Return" onPress={() => go('welcome')} />
        </View>
      </View>
    </View>
  );
}

function WalletScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={styles.screen}>
      <StatusChrome />
      <Header eyebrow="GOOD AFTERNOON" title={copy.student} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBottom}>
        <SectionLabel>YOUR CREDENTIALS</SectionLabel>
        <Pressable onPress={() => go('credential')}>
          <CredentialCard />
        </Pressable>
        <SummaryStats />
        <SectionLabel>PENDING</SectionLabel>
        <Notice
          icon="✉"
          tint={colors.red}
          bg={colors.softRed}
          title="AU Registrar wants to issue a credential"
          subtitle="Education Transcript VC · tap to review"
          onPress={() => go('offer')}
        />
        <Notice
          icon="◆"
          tint={colors.brown}
          bg={colors.sand}
          title="Employer A requests a verification"
          subtitle="Job application · JOB-2026-001"
          onPress={() => go('share')}
        />
      </ScrollView>
      <BottomNav active="wallet" go={go} />
    </View>
  );
}

function OfferScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={styles.screen}>
      <StatusChrome />
      <BackHeader title="New credential offer" subtitle="From AU Registrar" onBack={() => go('wallet')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
        <InfoPanel title="Education Transcript VC" rows={[['Issuer', 'AU Registrar'], ['Issuer DID', 'did:web:au.edu/issuer']]} />
        <InfoPanel
          title="Preview"
          rows={[
            ['Name', copy.student],
            ['Degree', copy.degree],
            ['Major', copy.major],
            ['Graduation date', copy.graduationISO],
            ['GPA', copy.gpa],
          ]}
        />
        <InfoPanel title="What happens next">
          <Text style={styles.smallBody}>
            Approving asks you to confirm identity, then after verified, AU signs and stores this credential in your wallet.
          </Text>
        </InfoPanel>
      </ScrollView>
      <View style={styles.actionStack}>
        <PrimaryButton label="Approve & continue" onPress={() => go('success')} />
        <SecondaryButton label="Decline" onPress={() => go('wallet')} />
      </View>
    </View>
  );
}

function SuccessScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={styles.screen}>
      <StatusChrome />
      <View style={styles.simpleTop}>
        <Text style={styles.pageTitle}>Issuance Success</Text>
        <Pressable onPress={() => go('wallet')}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
      <View style={styles.successHalo}>
        <View style={styles.haloOuter} />
        <View style={styles.haloMiddle} />
        <View style={styles.haloCore}>
          <Text style={styles.check}>✓</Text>
        </View>
      </View>
      <Text style={styles.successTitle}>Pass Added!</Text>
      <Text style={styles.successCopy}>Your AU verified credential has been successfully stored in your wallet.</Text>
      <View style={styles.storedCard}>
        <View style={styles.cardLogo}><Text style={styles.cardLogoText}>AU</Text></View>
        <View style={styles.storedText}>
          <Text style={styles.storedIssuer}>AU Registrar</Text>
          <Text style={styles.storedTitle}>Education{'\n'}Transcript VC</Text>
          <Text style={styles.storedDesc}>Bachelor of Science</Text>
        </View>
        <View style={styles.verifiedPill}><Text style={styles.verifiedText}>✓ Verified</Text></View>
      </View>
      <View style={styles.successActions}>
        <PrimaryButton label="▣  View Pass" onPress={() => go('credential')} />
        <SecondaryButton label="Go to Home" onPress={() => go('wallet')} />
      </View>
      <BottomNav active="wallet" go={go} />
    </View>
  );
}

function CredentialScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={styles.screen}>
      <StatusChrome />
      <BackHeader title="Education Transcript VC" subtitle="Stored · ready for verification" onBack={() => go('wallet')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
        <CredentialCard compact />
        <InfoPanel
          title="Credential claims"
          rows={[
            ['Student ID', copy.id],
            ['Degree', 'B.Sc.'],
            ['Major', copy.major],
            ['Graduation', copy.graduationISO],
            ['GPA', copy.gpa],
            ['Standing', 'Distinction'],
          ]}
        />
        <InfoPanel title="Metadata" rows={[['Issuer DID', 'did:web:au.edu'], ['Status', 'Active'], ['Storage', 'Permanent']]} />
      </ScrollView>
      <View style={styles.actionStack}>
        <PrimaryButton label="Use for job application" onPress={() => go('share')} />
      </View>
    </View>
  );
}

function ShareScreen({
  fields,
  setFields,
  go,
  onShare,
}: {
  fields: ShareFields;
  setFields: React.Dispatch<React.SetStateAction<ShareFields>>;
  go: (screen: Screen) => void;
  onShare: () => void;
}) {
  const toggle = (key: keyof ShareFields) => setFields((current) => ({ ...current, [key]: !current[key] }));

  return (
    <View style={styles.screen}>
      <StatusChrome />
      <BackHeader title="Share transcript proof" subtitle="Request from Employer A" onBack={() => go('credential')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
        <InfoPanel title="Requested fields">
          <FieldSwitch label="Degree name" code="degree_name" value={fields.degree} onPress={() => toggle('degree')} />
          <FieldSwitch label="Major" code="major" value={fields.major} onPress={() => toggle('major')} />
          <FieldSwitch label="Graduation date" code="graduation_date" value={fields.graduation} onPress={() => toggle('graduation')} />
          <FieldSwitch label="GPA" code="gpa" value={fields.gpa} onPress={() => toggle('gpa')} />
          <FieldSwitch label="Academic standing" code="academic_standing" value={fields.standing} onPress={() => toggle('standing')} last />
        </InfoPanel>
        <InfoPanel title="Share preview">
          <Text style={styles.smallBody}>
            Only the fields switched on are included. GPA and academic standing stay hidden unless you turn them on.
          </Text>
        </InfoPanel>
        <View style={styles.toast}>
          <View style={styles.toastDot} />
          <Text style={styles.toastText}>Shared with Employer A · verified in &lt;1s</Text>
        </View>
      </ScrollView>
      <View style={styles.actionStack}>
        <PrimaryButton label="Share proof" onPress={onShare} />
      </View>
    </View>
  );
}

function VerificationScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={styles.screen}>
      <StatusChrome />
      <BackHeader title="Verification result" subtitle="Employer A portal view" onBack={() => go('share')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
        <View style={styles.validBanner}>
          <View style={styles.validIcon}><Text style={styles.validCheck}>✓</Text></View>
          <View>
            <Text style={styles.validTitle}>Credential verified</Text>
            <Text style={styles.validSub}>Issuer and student proof are valid.</Text>
          </View>
        </View>
        <QrMock />
        <Text style={styles.qrCaption}>Verification QR / shared proof</Text>
        <InfoPanel
          title="Disclosed fields"
          rows={[
            ['Degree', copy.degree],
            ['Major', copy.major],
            ['Graduation', copy.graduationISO],
            ['GPA', 'Hidden'],
            ['Standing', 'Hidden'],
          ]}
        />
        <InfoPanel title="Trust chain">
          <Text style={styles.trustText}>AU Registrar → Student Wallet → Employer A</Text>
        </InfoPanel>
      </ScrollView>
      <View style={styles.actionStack}>
        <PrimaryButton label="Done" onPress={() => go('wallet')} />
      </View>
    </View>
  );
}

function ReceiptScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={styles.screen}>
      <StatusChrome />
      <BackHeader title="Disclosure Receipt" subtitle="Shared with Employer A" onBack={() => go('history')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
        <InfoPanel
          title="Transaction Summary"
          rows={[
            ['Recipient', 'Employer A'],
            ['Purpose', 'Job Application (JOB-2026-001)'],
            ['Date', '2024-10-27 09:41:21'],
          ]}
        />
        <InfoPanel
          title="Selective Disclosure Receipt"
          rows={[['Degree', copy.degree], ['Major', copy.major], ['Graduation', copy.graduationISO]]}
        />
        <InfoPanel
          title="Cryptographic Metadata"
          rows={[['Transaction ID', '0xabc...789'], ['Signature', '0x123...def'], ['Timestamp', '1672531200']]}
        />
      </ScrollView>
    </View>
  );
}

function HistoryScreen({ go, history }: { go: (screen: Screen) => void; history: HistoryEvent[] }) {
  return (
    <View style={styles.screen}>
      <StatusChrome />
      <Header eyebrow="Wallet Activity" title="History" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBottom}>
        <SectionLabel>THIS WEEK</SectionLabel>
        {history.map(event => (
          <Notice
            key={event.id}
            icon="✓"
            tint={colors.green}
            bg={'#E5F7EC'}
            {...event}
            onPress={() => go(event.targetScreen)}
          />
        ))}
      </ScrollView>
      <BottomNav active="history" go={go} />
    </View>
  );
}

function SettingsScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={styles.screen}>
      <StatusChrome />
      <Header eyebrow="Account" title="Settings" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBottom}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}><Text style={styles.avatarText}>EC</Text></View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Eric Criston</Text>
            <Text style={styles.profileMeta}>Student ID 6412345</Text>
          </View>
          <Text style={styles.schoolText}>Vicent Mary School of Engineering, Science and Technology</Text>
        </View>
        <SectionLabel>Security</SectionLabel>
        <SettingRow label="Require Face ID before sharing" toggleOn />
        <SectionLabel>Linked Issuers</SectionLabel>
        <SettingRow label="AU Registrar" />
        <SectionLabel>Account</SectionLabel>
        <SettingRow label="Revoke this device's key" danger />
        <Pressable style={styles.logoutButton} onPress={() => go('welcome')}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
      <BottomNav active="settings" go={go} />
    </View>
  );
}

function StatusChrome() {
  return (
    <View style={styles.status}>
      <Text style={styles.statusText}>9:41</Text>
      <View style={styles.battery}>
        <View style={styles.batteryInner}>
          <View style={styles.batteryCharge} />
        </View>
        <View style={styles.batteryTerminal} />
      </View>
    </View>
  );
}

function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.eyebrow, !title.includes(' ') && {marginTop: 10}]}>{eyebrow}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {title.includes(' ') && (
        <View style={styles.avatar}><Text style={styles.avatarText}>EC</Text></View>
      )}
    </View>
  );
}

function BackHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <View style={styles.backHeader}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>
      <View>
        <Text style={styles.backTitle}>{title}</Text>
        <Text style={styles.backSub}>{subtitle}</Text>
      </View>
    </View>
  );
}

function CredentialCard({ compact = false }: { compact?: boolean }) {
  return (
    <LinearGradient
      colors={[colors.red, colors.redMid, colors.redDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.credentialCard, compact && styles.credentialCardCompact]}
    >
      <View style={styles.ringOne} />
      <View style={styles.ringTwo} />
      <View style={styles.ringThree} />
      <View style={styles.credentialTop}>
        <View style={styles.auSeal}><Text style={styles.auSealText}>AU</Text></View>
        <View style={styles.activePill}>
          <Text style={styles.activeDot}>●</Text>
          <Text style={styles.activeText}>ACTIVE</Text>
        </View>
      </View>
      <Text style={styles.cardEyebrow}>EDUCATION TRANSCRIPT · VC</Text>
      <Text style={styles.degree}>{copy.degree}</Text>
      <Text style={styles.major}>{copy.majorFull}</Text>
      <View style={styles.cardMetaRow}>
        <View>
          <Text style={styles.cardMetaLabel}>{compact ? 'Holder' : 'Issued by'}</Text>
          <Text style={styles.cardMetaValue}>{compact ? copy.studentDetail : 'Assumption University'}</Text>
        </View>
        <View style={styles.cardMetaRight}>
          <Text style={styles.cardMetaLabel}>{compact ? 'GPA' : 'Graduated'}</Text>
          <Text style={styles.cardMetaValue}>{compact ? copy.gpa : copy.graduationDisplay}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function SummaryStats() {
  return (
    <View style={styles.summary}>
      <Stat value="1" label="Active VC" active />
      <Stat value="2" label="Pending" />
      <Stat value="<1s" label="Verify" />
    </View>
  );
}

function Stat({ value, label, active }: { value: string; label: string; active?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, active && { color: colors.red }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function Notice({
  icon,
  tint,
  bg,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  tint: string;
  bg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.notice} onPress={onPress}>
      <View style={[styles.noticeIcon, { backgroundColor: bg }]}>
        <Text style={[styles.noticeIconText, { color: tint }]}>{icon}</Text>
      </View>
      <View style={styles.noticeText}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeSub}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function InfoPanel({
  title,
  rows,
  children,
}: {
  title: string;
  rows?: Array<[string, string]>;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.infoPanel}>
      <Text style={styles.infoTitle}>{title}</Text>
      {rows?.map(([key, value]) => (
        <View style={styles.infoRow} key={`${title}-${key}`}>
          <Text style={styles.infoKey}>{key}</Text>
          <Text
            style={[
              styles.infoValue,
              value === 'Active' && { color: colors.green },
              value === 'Hidden' && { color: colors.hidden },
            ]}
          >
            {value}
          </Text>
        </View>
      ))}
      {children}
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

function FieldSwitch({
  label,
  code,
  value,
  onPress,
  last,
}: {
  label: string;
  code: string;
  value: boolean;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable style={[styles.switchRow, last && { marginBottom: 0 }]} onPress={onPress}>
      <View>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchCode}>{code}</Text>
      </View>
      <View style={[styles.switchTrack, value && styles.switchTrackOn]}>
        <View style={[styles.switchKnob, value && styles.switchKnobOn]} />
      </View>
    </Pressable>
  );
}

function SettingRow({ label, danger, toggleOn }: { label: string; danger?: boolean; toggleOn?: boolean }) {
  return (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, danger && { color: colors.red }]}>{label}</Text>
      {toggleOn ? (
        <View style={[styles.switchTrack, styles.switchTrackOn]}>
          <View style={[styles.switchKnob, styles.switchKnobOn]} />
        </View>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </View>
  );
}

function QrMock() {
  const filled = new Set([0, 1, 2, 3, 4, 5, 6, 7, 10, 13, 14, 16, 19, 21, 22, 25, 28, 29, 30, 31, 34, 35, 36, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48]);

  return (
    <View style={styles.qr}>
      {Array.from({ length: 49 }).map((_, index) => (
        <View key={index} style={[styles.qrPixel, filled.has(index) && styles.qrPixelOn]} />
      ))}
    </View>
  );
}

function BottomNav({ active, go }: { active: 'wallet' | 'history' | 'settings'; go: (screen: Screen) => void }) {
  const item = (key: 'wallet' | 'history' | 'settings', icon: string, label: string, screen: Screen) => {
    const isActive = active === key;
    return (
      <Pressable style={styles.navItem} onPress={() => go(screen)}>
        <Text style={[styles.navIcon, isActive && styles.navActive]}>{icon}</Text>
        <Text style={[styles.navText, isActive && styles.navActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.bottomNav}>
      {item('wallet', '◆', 'Wallet', 'wallet')}
      {item('history', '≡', 'History', 'history')}
      {item('settings', '⚙', 'Settings', 'settings')}
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE7E3',
  },
  phone: {
    width: 375,
    height: 760,
    maxHeight: '100%',
    backgroundColor: colors.bg,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: '#17140F',
    overflow: 'hidden',
    shadowColor: '#1C1A17',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 12,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  status: {
    height: 44,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  logoGlow: {
    position: 'absolute',
    top: 50,
    right: -71,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.softRed,
    opacity: 0.85,
  },
  logoContainer: {
    marginTop: 5,
    marginHorizontal: 9,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeLogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  welcomeCopy: {
    marginTop: 20,
    paddingHorizontal: 42,
    alignItems: 'center',
  },
  welcomeCopy: {
    marginTop: -12,
    paddingHorizontal: 42,
    alignItems: 'center',
  },
  eyebrowCentered: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.1,
    textAlign: 'center',
  },
  welcomeTitle: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerBody: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  loginPanel: {
    marginTop: 100,
    marginHorizontal: 20,
    padding: 20,
    height: 140,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    shadowColor: '#1C1A17',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 6,
    justifyContent: 'space-between',
  },
  panelHeading: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    height: 46,
    backgroundColor: colors.bg,
    borderRadius: 16,
    paddingHorizontal: 13,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '500',
  },
  pinInputHidden: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  pinBox: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.ink,
  },
  smallBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 15,
  },
  header: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 1.05,
  },
  headerTitle: {
    marginTop: 2,
    color: colors.ink,
    fontSize: 21,
    fontWeight: '700',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollBottom: {
    paddingHorizontal: 20,
    paddingBottom: 108,
  },
  sectionLabel: {
    marginTop: 12,
    marginBottom: 13,
    color: colors.muted,
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 1.05,
    textTransform: 'uppercase',
  },
  credentialCard: {
    height: 190,
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#1C1A17',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 8,
  },
  credentialCardCompact: {
    height: 199,
    marginTop: 8,
  },
  ringOne: {
    position: 'absolute',
    top: -38,
    right: -37,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ringTwo: {
    position: 'absolute',
    top: -22,
    right: -21,
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  ringThree: {
    position: 'absolute',
    top: -6,
    right: -5,
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  credentialTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  auSeal: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  auSealText: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '700',
  },
  activePill: {
    width: 76,
    height: 24,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeDot: {
    color: colors.mint,
    fontSize: 8,
    fontWeight: '700',
  },
  activeText: {
    color: colors.card,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
  },
  cardEyebrow: {
    marginTop: 18,
    color: colors.card,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
  },
  degree: {
    marginTop: 8,
    color: colors.card,
    fontSize: 19,
    fontWeight: '700',
  },
  major: {
    marginTop: 8,
    color: colors.card,
    fontSize: 12.5,
  },
  cardMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMetaRight: {
    alignItems: 'flex-end',
  },
  cardMetaLabel: {
    color: colors.card,
    fontSize: 11.5,
    opacity: 0.85,
  },
  cardMetaValue: {
    marginTop: 1,
    color: colors.card,
    fontSize: 13,
    fontWeight: '600',
  },
  summary: {
    marginTop: 32,
    height: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    width: 76,
    alignItems: 'center',
  },
  statValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 7,
    color: colors.muted,
    fontSize: 10.5,
    fontWeight: '500',
  },
  notice: {
    height: 62,
    marginBottom: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeIconText: {
    fontSize: 15,
    fontWeight: '600',
  },
  noticeText: {
    flex: 1,
    marginLeft: 7,
  },
  noticeTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  noticeSub: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 11.5,
  },
  chevron: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(250,247,245,0.94)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 15,
  },
  navItem: {
    width: 80,
    alignItems: 'center',
  },
  navIcon: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
  },
  navText: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  navActive: {
    color: colors.red,
  },
  backHeader: {
    height: 70,
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backArrow: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  backTitle: {
    color: colors.ink,
    fontSize: 14.5,
    fontWeight: '700',
  },
  backSub: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 11,
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingBottom: 112,
    gap: 12,
  },
  infoPanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoTitle: {
    marginBottom: 12,
    color: colors.ink,
    fontSize: 12.5,
    fontWeight: '700',
  },
  infoRow: {
    minHeight: 23,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoKey: {
    width: 130,
    color: colors.muted,
    fontSize: 12,
  },
  infoValue: {
    flex: 1,
    color: colors.ink,
    fontSize: 11.5,
    textAlign: 'right',
    fontWeight: '500',
  },
  actionStack: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 36,
    gap: 8,
  },
  primaryButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  simpleTop: {
    height: 68,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  doneText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  successHalo: {
    height: 164,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloOuter: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: '#DDF7E9',
  },
  haloMiddle: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#BDEED2',
  },
  haloCore: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: colors.card,
    fontSize: 34,
    fontWeight: '800',
  },
  successTitle: {
    marginTop: 28,
    color: colors.blueInk,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  successCopy: {
    marginTop: 8,
    marginHorizontal: 54,
    color: colors.blueMuted,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  storedCard: {
    marginTop: 10,
    marginHorizontal: 20,
    height: 138,
    borderRadius: 22,
    backgroundColor: colors.red,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLogoText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '800',
  },
  storedText: {
    marginLeft: 16,
    flex: 1,
  },
  storedIssuer: {
    color: colors.card,
    fontSize: 12,
    opacity: 0.85,
  },
  storedTitle: {
    marginTop: 4,
    color: colors.card,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  storedDesc: {
    marginTop: 2,
    color: colors.card,
    fontSize: 12,
    opacity: 0.9,
  },
  verifiedPill: {
    position: 'absolute',
    right: 22,
    top: 58,
    width: 82,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: colors.card,
    fontSize: 11,
    fontWeight: '600',
  },
  successActions: {
    marginTop: 18,
    marginHorizontal: 32,
    gap: 8,
  },
  switchRow: {
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '500',
  },
  switchCode: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 10.5,
  },
  switchTrack: {
    width: 38,
    height: 22,
    borderRadius: 11,
    padding: 2,
    backgroundColor: colors.border,
  },
  switchTrackOn: {
    backgroundColor: colors.red,
  },
  switchKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.card,
  },
  switchKnobOn: {
    transform: [{ translateX: 16 }],
  },
  toast: {
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.red,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.card,
    marginRight: 10,
  },
  toastText: {
    color: colors.card,
    fontSize: 12.5,
    fontWeight: '600',
  },
  validBanner: {
    height: 84,
    borderRadius: 18,
    backgroundColor: '#E5F7EC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  validIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  validCheck: {
    color: colors.card,
    fontSize: 22,
    fontWeight: '800',
  },
  validTitle: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '700',
  },
  validSub: {
    marginTop: 4,
    color: colors.green,
    fontSize: 11.5,
  },
  qr: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5.2,
  },
  qrPixel: {
    width: 7.7,
    height: 7.7,
    borderRadius: 2,
    backgroundColor: colors.card,
  },
  qrPixelOn: {
    backgroundColor: colors.ink,
  },
  qrCaption: {
    color: colors.ink,
    fontSize: 12,
    textAlign: 'center',
  },
  trustText: {
    color: colors.ink,
    fontSize: 12,
  },
  profileCard: {
    minHeight: 108,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 18,
  },
  profileAvatar: {
    position: 'absolute',
    top: 12,
    left: 18,
    width: 46,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    marginLeft: 58,
  },
  profileName: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '700',
  },
  profileMeta: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 10.5,
  },
  schoolText: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 10.5,
    lineHeight: 13,
  },
  settingRow: {
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '500',
  },
  logoutButton: {
    height: 46,
    marginTop: 110,
    borderRadius: 16,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '700',
  },
  battery: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryInner: {
    width: 20,
    height: 9,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 2.5,
    padding: 1,
  },
  batteryCharge: {
    width: '70%',
    height: '100%',
    backgroundColor: colors.ink,
    borderRadius: 1,
  },
  batteryTerminal: {
    width: 1,
    height: 4,
    backgroundColor: colors.ink,
    marginLeft: 1,
  },
});
