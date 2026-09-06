---
title: Power Automate Flow Setup - Document Library Sync
description: Step-by-step build guide for the automated cloud flow that links Shared Documents library uploads to Solution Documents list items
author: Tech Elixir Solution Center Team
ms.date: 2026-09-06
ms.topic: how-to
keywords:
  - power automate
  - solution documents
  - document sync
  - automation
estimated_reading_time: 10
---

## Purpose

This guide walks through building the Power Automate cloud flow that automatically links files uploaded to the Shared Documents library into the **Solution Documents** list, so the Solution Center Documents tab stays current without manual scripting.

The flow mirrors the field mapping and filename-parsing logic used by [Sync-DocumentsFromLibrary.ps1](../scripts/Sync-DocumentsFromLibrary.ps1), so both remain interchangeable if a manual backfill is ever needed.

## Prerequisites

* A SharePoint connection authorized against `https://tecanada.sharepoint.com/sites/TechElixirApps`.
* A Solution Registry item already created for the target solution (for example, `AndreCampbell.ca Website Upgrade`).
* Files uploaded under a known project folder inside the Shared Documents library.

## 1. Create the flow and trigger

In [Power Automate](https://make.powerautomate.com), select **Create > Automated cloud flow**, then add the trigger:

* Connector: SharePoint
* Trigger: **When a file is created or modified (properties only)**
* Site Address: `https://tecanada.sharepoint.com/sites/TechElixirApps`
* Library Name: `Documents`

## 2. Scope the flow to the project folder

Add a **Condition** action directly after the trigger to skip unrelated folders and non-markdown files:

```text
and(
  contains(triggerOutputs()?['body/{Path}'], 'Andre''s Website Update'),
  endsWith(triggerOutputs()?['body/{FilenameWithExtension}'], '.md')
)
```

Add every subsequent action inside the **If yes** branch.

## 3. Resolve the Solution Registry parent

Add **Get items** (SharePoint):

* List: `Solution Registry`
* Filter Query: `Title eq 'AndreCampbell.ca Website Upgrade'`
* Top Count: `1`

## 4. Parse the file name into section metadata

Add each **Compose** action below in order, naming every action exactly as shown, since later expressions reference these names via `outputs('<ActionName>')`.

### Compose - FileNameNoExt

```text
substring(
  triggerOutputs()?['body/{FilenameWithExtension}'],
  0,
  lastIndexOf(triggerOutputs()?['body/{FilenameWithExtension}'], '.')
)
```

### Compose - HyphenIndex

```text
indexOf(outputs('FileNameNoExt'), '-')
```

### Compose - NumberCandidate

```text
if(
  greater(outputs('HyphenIndex'), -1),
  substring(outputs('FileNameNoExt'), 0, outputs('HyphenIndex')),
  ''
)
```

### Compose - TitleCandidateRaw

```text
if(
  greater(outputs('HyphenIndex'), -1),
  substring(
    outputs('FileNameNoExt'),
    add(outputs('HyphenIndex'), 1),
    sub(length(outputs('FileNameNoExt')), add(outputs('HyphenIndex'), 1))
  ),
  outputs('FileNameNoExt')
)
```

### Compose - IsNumberedSection

```text
and(
  equals(length(outputs('NumberCandidate')), 2),
  contains('0123456789', substring(outputs('NumberCandidate'), 0, 1)),
  contains('0123456789', substring(outputs('NumberCandidate'), 1, 1))
)
```

### Compose - SectionNumber

```text
if(outputs('IsNumberedSection'), outputs('NumberCandidate'), '')
```

### Compose - SectionTitleRaw

```text
if(outputs('IsNumberedSection'), outputs('TitleCandidateRaw'), outputs('FileNameNoExt'))
```

### Compose - SectionTitle

```text
trim(replace(replace(outputs('SectionTitleRaw'), '-', ' '), '_', ' '))
```

### Compose - SectionKey

```text
toLower(outputs('FileNameNoExt'))
```

## 5. Check for an existing Solution Documents row

Add **Get items** (SharePoint):

* List: `Solution Documents`
* Filter Query: build via the dynamic content and expression picker, combining these three parts in order:
  1. Literal text: `SolutionId eq '`
  2. Expression: `first(outputs('Get_items')?['body/value'])?['ID']`
  3. Literal text: `' and SectionKey eq '`
  4. Expression: `outputs('SectionKey')`
  5. Literal text: `'`
* Top Count: `1`

## 6. Create or update the Solution Documents item

Add a **Condition** action:

```text
greater(length(outputs('Get_items_2')?['body/value']), 0)
```

### If yes - Update item

* Connector: SharePoint
* List: `Solution Documents`
* Id: `first(outputs('Get_items_2')?['body/value'])?['ID']`

### If no - Create item

* Connector: SharePoint
* List: `Solution Documents`

Both branches use the same field values.

| Field | Value |
|---|---|
| Title | `{FilenameWithExtension}` (dynamic content from trigger) |
| SolutionId | `first(outputs('Get_items')?['body/value'])?['ID']` |
| SectionKey | `outputs('SectionKey')` |
| SectionNumber | `outputs('SectionNumber')` |
| SectionTitle | `outputs('SectionTitle')` |
| Status | `Current` |
| Url | `Link to item` (dynamic content from trigger) |
| LastUpdated | `utcNow()` |
| Owner | `Andre Campbell` (or `{ModifiedBy}` dynamic content) |

## 7. Save and test

* Save the flow, then upload or modify a file in the folder to trigger a real run, or use **Test > Manually** and re-save an existing file.
* Check the run history for each action's outputs if anything errors. The Compose steps expose intermediate values (`FileNameNoExt`, `SectionKey`, and so on) directly, which makes debugging straightforward.

## Verifying the result

After a successful run, confirm the Solution Documents list contains a row matching the uploaded file, then refresh the Solution Center Documents tab to confirm the Documentation Completeness percentage reflects the new data.
