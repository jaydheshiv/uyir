import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import type { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';

interface TavusConversationProps {
    conversationUrl: string;
    onLeave?: () => void;
    onError?: (error: Error) => void;
}

export interface TavusConversationHandle {
    sendMessage: (text: string) => void;
}

const TavusConversation = React.forwardRef(({
    conversationUrl,
    onLeave,
    onError,
}: TavusConversationProps, ref: any) => {
    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // JavaScript to auto-join and hide UI elements while showing avatar
    const injectedJavaScript = (
        '(function(){' +
        'var joined=false;var avatarReady=false;' +
        'function autoJoin(){try{' +
        'if(joined)return;' +
        'var joinBtn=Array.from(document.querySelectorAll("button")).find(b=>/join|start|ready/i.test(b.textContent||""));' +
        'if(joinBtn){joinBtn.click();joined=true;console.log("[Tavus] Auto-joined");setTimeout(checkAvatar,2000);}' +
        '}catch(e){console.log("[Tavus] autoJoin error",e);}}' +
        'function checkAvatar(){try{' +
        'var remoteVids=Array.from(document.querySelectorAll("video")).filter(v=>v.getAttribute("data-local")!=="true");' +
        'if(remoteVids.length>0){avatarReady=true;console.log("[Tavus] Avatar ready");cleanupUI();window.ReactNativeWebView&&window.ReactNativeWebView.postMessage("AVATAR_READY");}else{setTimeout(checkAvatar,500);}' +
        '}catch(e){console.log("[Tavus] checkAvatar error",e);}}' +
        'function injectStyles(){' +
        'if(document.getElementById("__tavus_styles")) return;' +
        'var s=document.createElement("style");s.id="__tavus_styles";s.textContent=' +
        '"*[data-local=\\"true\\"],*[data-local=true]{display:none!important;}" +' +
        '"body,html{margin:0!important;padding:0!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#000!important;position:relative!important;}" +' +
        '"body>*{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:100%!important;}" +' +
        '"video{position:fixed!important;top:0!important;left:0!important;width:100%!important;height:100%!important;object-fit:cover!important;z-index:999!important;}" +' +
        '"video[data-local=\\"true\\"],video[data-local=true]{display:none!important;}";' +
        'document.head.appendChild(s);console.log("[Tavus] Styles injected");' +
        'document.querySelectorAll("video:not([data-local=true])").forEach(v=>{v.style.cssText="position:fixed!important;top:0!important;left:0!important;width:100%!important;height:100%!important;object-fit:cover!important;z-index:999!important;";});}' +
        'function cleanupUI(){if(!avatarReady)return;try{' +
        'injectStyles();' +
        'var kills=["(You)","Turn on","Mute","Unmute","Leave","More","people in call","Waiting for","Allow camera","CPU usage"];' +
        'document.querySelectorAll("div,span,p,button,nav,header,footer").forEach(function(e){' +
        'var t=(e.textContent||"").trim();var isVideo=e.querySelector("video");' +
        'if(!isVideo&&kills.some(k=>t.includes(k))&&t.length<150){e.style.display="none";}' +
        '});' +
        '}catch(e){console.log("[Tavus] cleanup error",e);}}' +
        'function observe(){var o=new MutationObserver(function(){if(!joined)autoJoin();else if(avatarReady)cleanupUI();});o.observe(document.documentElement,{childList:true,subtree:true});}' +
        'window.__tavusSendMessage=function(msg){try{var i=document.querySelector("input[type=text], textarea");if(!i)return;i.value=msg;i.dispatchEvent(new Event("input",{bubbles:true}));var b=Array.from(document.querySelectorAll("button")).find(b=>/send|arrow/i.test(b.textContent||"")||b.getAttribute("type")==="submit");if(b)b.click();else{i.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,code:"Enter",keyCode:13}));}console.log("[Tavus] Msg sent");}catch(e){console.log("[Tavus] send error",e);}};' +
        'function init(){console.log("[Tavus] Init started");injectStyles();observe();setInterval(function(){if(!joined)autoJoin();else if(avatarReady)cleanupUI();},400);}' +
        'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}' +
        '})();true;'
    );

    const handleClose = useCallback(() => {
        onLeave?.();
    }, [onLeave]);

    const handleReload = useCallback(() => {
        setError(null);
        setIsLoading(true);
        webViewRef.current?.reload();
    }, []);

    // Expose sendMessage to parent via ref
    useImperativeHandle(ref, () => ({
        sendMessage: (text: string) => {
            if (!text.trim()) return;
            const escaped = text.replace(/`/g, '\\`').replace(/\\/g, '\\\\');
            const js = 'window.__tavusSendMessage && window.__tavusSendMessage(' + JSON.stringify(escaped) + '); true;';
            webViewRef.current?.injectJavaScript(js);
        },
    }), []);

    const handleWebViewError = useCallback(
        (event: WebViewErrorEvent) => {
            const message = event.nativeEvent.description || 'Unable to load conversation';
            setError(message);
            setIsLoading(false);
            onError?.(new Error(message));
        },
        [onError],
    );

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
                    <Ionicons name="refresh" size={18} color="#fff" />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }

    const handleMessage = useCallback((event: any) => {
        const message = event.nativeEvent.data;
        if (message === 'AVATAR_READY') {
            console.log('[Tavus] Avatar ready message received');
            setIsLoading(false);
        }
    }, []);

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ uri: conversationUrl }}
                onLoadStart={() => setIsLoading(true)}
                onMessage={handleMessage}
                onError={handleWebViewError}
                injectedJavaScript={injectedJavaScript}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                style={styles.webView}
            />
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#8170FF" />
                    <Text style={styles.loadingText}>Connecting to conversation...</Text>
                </View>
            )}
        </View>
    );
});
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        width: '100%',
        height: '100%',
    },
    // Removed toolbar for cleaner single-avatar view
    webView: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    loadingOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 18,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8170FF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        marginBottom: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#999',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default TavusConversation;
