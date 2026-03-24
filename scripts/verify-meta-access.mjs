import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const META_API = 'https://graph.facebook.com/v19.0';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const IG_ACCOUNT_ID = process.env.META_IG_ACCOUNT_ID;
const FB_PAGE_ID = process.env.META_FB_PAGE_ID;

async function apiCall(url) {
    const res = await fetch(url);
    return await res.json();
}

async function verifyAccess() {
    console.log('\n🔱 AAK NATION: META & INSTAGRAM ACCESS AUDIT');
    console.log('=' . repeat(50));

    if (!ACCESS_TOKEN) {
        console.error('❌ CRITICAL: META_ACCESS_TOKEN is missing from .env');
        return;
    }

    // 1. Audit Token/App Scope
    console.log('\n1️⃣ [TOKEN AUDIT]');
    try {
        const debug = await apiCall(`https://graph.facebook.com/debug_token?input_token=${ACCESS_TOKEN}&access_token=${ACCESS_TOKEN}`);
        console.log('✅ Token Info:', JSON.stringify(debug.data, null, 2));
    } catch (e) {
        console.log('⚠️ Could not debug token directly (requires App Access Token). Skipping...');
    }

    // 2. Instagram Business Account Audit
    console.log('\n2️⃣ [INSTAGRAM AUDIT]');
    if (!IG_ACCOUNT_ID) {
        console.error('❌ IG_ACCOUNT_ID is missing.');
    } else {
        try {
            const igData = await apiCall(`${META_API}/${IG_ACCOUNT_ID}?fields=username,name,follows_count,followers_count&access_token=${ACCESS_TOKEN}`);
            if (igData.error) {
                console.error('❌ IG Access Denied:', igData.error.message);
            } else {
                console.log(`✅ IG Account Found: @${igData.username} (${igData.name})`);
                console.log(`📊 Stats: ${igData.followers_count} followers, ${igData.follows_count} following.`);
            }
        } catch (e) { console.error('❌ IG Fetch failed:', e.message); }
    }

    // 3. Facebook Page Audit
    console.log('\n3️⃣ [FACEBOOK AUDIT]');
    if (!FB_PAGE_ID) {
        console.error('❌ FB_PAGE_ID is missing.');
    } else {
        try {
            const fbData = await apiCall(`${META_API}/${FB_PAGE_ID}?fields=name,category,link,is_published&access_token=${ACCESS_TOKEN}`);
            if (fbData.error) {
                console.error('❌ FB Access Denied:', fbData.error.message);
            } else {
                console.log(`✅ FB Page Found: ${fbData.name} (${fbData.category})`);
                console.log(`📡 Status: ${fbData.is_published ? 'Published' : 'Unpublished'}`);
            }
        } catch (e) { console.error('❌ FB Fetch failed:', e.message); }
    }

    // 4. Permissions Check (Self-Audit)
    console.log('\n4️⃣ [PERMISSIONS AUDIT]');
    try {
        const perms = await apiCall(`${META_API}/me/permissions?access_token=${ACCESS_TOKEN}`);
        const active = perms.data?.filter(p => p.status === 'granted').map(p => p.permission) || [];
        console.log('✅ Granted Permissions:', active.join(', '));
        
        const required = ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement', 'pages_manage_posts'];
        const missing = required.filter(p => !active.includes(p));
        
        if (missing.length > 0) {
            console.warn('⚠️ WARNING: Missing recommended permissions:', missing.join(', '));
        } else {
            console.log('💎 ALL REQUIRED PUBLISHING PERMISSIONS VERIFIED.');
        }
    } catch (e) { console.error('❌ Permissions check failed:', e.message); }

    console.log('\n' + '=' . repeat(50));
    console.log('✨ Access audit complete.');
}

verifyAccess();
