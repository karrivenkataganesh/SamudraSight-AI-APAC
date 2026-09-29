# Aegis-APAC | Anticipatory Disaster Management & Parametric Resilience Platform

> **Bay of Bengal Operational Emergency Command System (Godavari-Kakinada Sector)**  
> Engineered for real-time storm surge prediction, critical asset protection, and automated parametric micro-payout execution before tropical cyclone landfall.

---

## 1. System Architecture & Overview

Aegis-APAC provides early warning, anticipatory risk mitigation, and instant liquidity disbursement across coastal Andhra Pradesh and Odisha:
- **Interactive T-72 to T-0 Time Scrubber**: Dynamic storm surge and flood mask propagation modeled from Synthetic Aperture Radar (SAR) backscatter and tidal bathymetry.
- **Critical Infrastructure IoT HUD**: Live telemetry monitoring for power substations, trauma hospitals, coastal evacuation corridors, and cyclone shelters.
- **Gemini 3.7 Flash Multimodal Risk Engine**: Structured tactical impact analysis with automated multi-tier model fallback ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`).
- **Automated Multi-Lingual Civil Protection Advisory**: Real-time broadcast copy generation formatted for SMS Cell Broadcast, WhatsApp community groups, and loudspeaker sirens in English, Telugu (తెలుగు), and Odia (ଓଡ଼ିଶା).
- **Bay of Bengal Parametric Disaster Resilience Facility (BODRF)**: Autonomous trigger disbursing ₹4.20 Crore (~$504,000 USD) pre-landfall micro-liquidity to 12,000 coastal households upon verified &gt;180 km/h wind trigger.

---

## 2. Agentic Threat Model (The 5 Threat Zones)

| Threat Zone | Identified Attack Surface | Countermeasure Implemented |
| :--- | :--- | :--- |
| **1. Input Surfaces** | Malicious injection in municipal advisory prompts; parameter tampering in coordinate/flood geometry. | Strict numerical boundary constraints, null-safe payload deserialization, defensive fallback destructuring. |
| **2. Planning & Reasoning** | Prompt injection attempting to bypass emergency protocols or sabotage evacuation routing. | Server-side immutable system instructions, enforced JSON response schema via Gemini `Type.OBJECT`. |
| **3. Tool Execution** | SSRF or unauthorized external telemetry requests attempting lateral cloud movement. | Sandboxed synthetic GeoJSON boundaries, strict domain allowlist, zero dynamic code evaluation sinks. |
| **4. Memory & State** | Session hijacking, cross-agency state leakage, unverified modification of emergency checklist or trigger status. | Strict client-side isolation, owner-bound state verification pattern, zero unverified state mutations. |
| **5. Inter-System Comm** | Exposure of `GEMINI_API_KEY` to client browser bundles or unencrypted transit. | Server-side proxy (`/api/gemini/*`), Secret Manager IAM role delegation, zero browser key leaks. |

---

## 3. Cloud Run Deployment Guide

### Prerequisites
1. Install and initialize the Google Cloud SDK:
   ```bash
   gcloud init
   gcloud auth login
   ```
2. Enable the required GCP APIs:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     secretmanager.googleapis.com \
     firestore.googleapis.com \
     cloudbuild.googleapis.com
   ```

### Step 1: Secret Manager Setup
Store your Gemini API Key in Google Cloud Secret Manager:
```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 2: Firestore Security Rules Configuration
Deploy owner-bound security rules for state persistence:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /disaster_telemetry/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Step 3: Deploy to Cloud Run
Deploy the container directly to Google Cloud Run:
```bash
gcloud run deploy aegis-apac \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

### Step 4: Campaign Verification Labeling
Apply the mandatory resource label to register the service for automated challenge verification:
```bash
gcloud run services update aegis-apac \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-southeast1
```

---

## 4. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local full-stack development server (Express + Vite)
npm run dev

# 3. Production build
npm run build
```

---

## 5. Functional Stability Walkthrough Matrix

- **TC-01 (Timeline Scrubbing)**: Scrub slider from T-72 to T-0. Observe animated coastal flood polygon inland expansion and storm surge height increase to +6.2m.
- **TC-02 (Asset Inspection)**: Click on map pins (Hospital, Substation, Route 16). Verify asset drawer updates with live telemetry, optical crops, and checklist toggles.
- **TC-03 (Gemini 3.7 AI Risk Analysis)**: Click "Run Multimodal Risk Assessment". Confirm resilient model fallback execution and live card rendering.
- **TC-04 (Multi-Lingual Advisories)**: Click "Generate Municipal Advisory". Switch between English, Telugu, and Odia. Test the simulated siren audio alert.
- **TC-05 (Parametric Micro-Payout)**: Click "Simulate Parametric Insurance Trigger". Inspect oracle verification, ward breakdown, and batch transaction hashes.
