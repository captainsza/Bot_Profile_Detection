/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// frontend/app/api/predict/route.ts
import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inputData = JSON.stringify(body);
    const pythonProcess = spawn("python", ["./predict.py"]);

    let result = "";
    let errorOutput = "";

    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();

    return new Promise((resolve) => {
      pythonProcess.stdout.on("data", (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          return resolve(
            NextResponse.json(
              { error: "Python script error", details: errorOutput },
              { status: 500 }
            )
          );
        }
        try {
          // Trim the result to remove any extra whitespace/newlines
          const jsonResult = JSON.parse(result.trim());
          resolve(NextResponse.json(jsonResult));
        } catch (e) {
          resolve(
            NextResponse.json(
              { error: "Failed to parse Python output", details: result },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
