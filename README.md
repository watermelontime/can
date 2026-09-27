# CAN Tools

This project is a small website with browser-based tools for working with CAN (Controller Area Network) technology.
All 3 CAN variants are supported: CAN CC, CAN FD, CAN XL.

It provides practical helpers for:

- evaluating CAN register settings
- exploring CAN XL bit timing configuration
- generating visual CAN frames for learning and testing

## Project overview

The landing page in [index.html](index.html) links to the available tools:

- [reg_eval/index.html](reg_eval/index.html) — CAN Register Evaluator
- [xl_bt/index.html](xl_bt/index.html) — CAN XL Bit Timing Calculator
- [frame/index.html](frame/index.html) — CAN Frame Generator

## Purpose

The goal of this project is to make CAN configuration and timing concepts easier to understand and to provide useful examples for engineers, developers, and students.

## Notes

- The project uses plain HTML, CSS, and JavaScript.
- No build step is required for the basic static pages.
- Assets such as screenshots and diagrams are stored in the project folders.
