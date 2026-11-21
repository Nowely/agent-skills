---
name: adaptive-frontend
description: Implement responsive changes to an existing interactive UI. Use for grouped design frames, components embedded in different hosts, or actions whose state must survive a layout change.
metadata:
  version: "0.42.0"
license: MIT
---

# Deliver a responsive change

## Establish what the user must be able to do

Open the public screen or story and perform the primary action. Trace its entry point to the consumers affected by the change. Identify their shared behavior and any intentional differences. Record the route, starting state, input and observable result so you can replay the journey.

Read the design frames together. Establish what stays grouped, what moves or wraps, and how users reach the action. Measure the component's available width and the viewport. Find which element controls the layout before choosing a breakpoint.

When a frame shows only a closed control, exercise the closest working interaction in the product. Observe what opens on the first gesture, the next step and the result. Reuse the composition if it fits this consumer's contract. If an open design explicitly changes the steps, selection or result, surface the difference and its consequence before implementing. Resolve questions from the design, data contract and consumers first. Ask the owner when two materially different outcomes remain. Continue independent work. When the decision changes, update the affected paths and their checks together.

## Choose a slice that can expose a wrong decision

Write a short acceptance contract in the user's terms. What should they be able to read, compare or change? What must stay true around that action? Choose the smallest public surface on which a wrong answer would be visible. If the meaning of one element depends on another, show them together. For example, use contrasting records under one shared heading, or select one item and exercise an auxiliary action inside a different item. An unintended change of selection will then be visible.

Match each materially different design frame to data that renders its content. For a resize journey, keep one record and its state fixed in the same mounted instance. Include a valid case where regions compete for space. When a decision will carry across consumers, render one complete slice with real content and check the contract before repeating it. A story can supply data and a resizable host; put the behavior in the component users receive.

## Verify the result in the browser

- Use a clean Playwright context for a public story. Open a signed-in host with its configured persistent Playwright profile, one owner at a time. While it is occupied, continue the checks that a public story can answer.
- Compare each relevant frame at its measured content width, state, locale and scale. Inspect hierarchy, grouping, alignment, spacing, type and action placement. Where neighboring elements communicate a relationship, check it on the composed screen. Individual bounds or a total screenshot height can look correct while the user reads the wrong association.
- Enter a meaningful, non-default state, resize the same mounted host through its distinct modes, then finish the action. Compare the first gesture, options and relevant focus to the working precedent. Choose a different value and verify what the consumer receives. Follow the interaction through dismissal. Check the surrounding state that must survive.
- At a width where space is tight, check reachability and unexpected overflow on both the host and the page. For a scrollable or draggable control, try the page gesture over it and the intended gesture inside it. Record which surface moves and how the evidence was obtained (emulation, synthesized input or device).
- After a fix, replay the failing case and the nearest previously passing case affected by the same decision. If their content shares a layout, exercise both in that layout. Use the existing behavioral checks for state, requests and consumer contracts where applicable.

## Decide when to hand off

For each material requirement, identify the observation that proves it on the delivered surface. Exercise the shared behavior and each consumer-specific obligation through the affected public entries. For a distributed component, use the same built artifact for these checks and complete the action. Keep working on a known, correctable gap, including one the current tests do not cover. If a necessary check is genuinely blocked, report partial completion, what is missing and what would unlock it.

Hand off the public route, representative inputs, measured width, comparable images and observed result for the decisive cases. State remaining deviations and the limits of the checks. A separate Entrust live prober is optional when independent replay of a first slice could change substantial remaining work.
