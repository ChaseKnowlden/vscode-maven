// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { setUserError } from "vscode-extension-telemetry-wrapper";
import { MavenProject } from "../explorer/model/MavenProject";
import { rawDependencyTree } from "../utils/mavenUtils";
import { dependenciesContentUri } from "../utils/uiUtils";

export async function showDependenciesHandler(project: MavenProject): Promise<void> {
    const uri = dependenciesContentUri(project.pomPath);
    await vscode.window.showTextDocument(uri);
}

export async function getDependencyTree(pomPathOrMavenProject: string | MavenProject): Promise<string | undefined> {
    let pomPath: string;
    let name: string;
    if (typeof pomPathOrMavenProject === "object" && pomPathOrMavenProject instanceof MavenProject) {
        const mavenProject: MavenProject = <MavenProject>pomPathOrMavenProject;
        pomPath = mavenProject.pomPath;
        name = mavenProject.name;
    } else if (typeof pomPathOrMavenProject === "string") {
        pomPath = pomPathOrMavenProject;
        name = pomPath;
    } else {
        return undefined;
    }
    return await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        cancellable: false
    }, async (p: vscode.Progress<{ message?: string }>, _token: vscode.CancellationToken) => new Promise<string | undefined>(
        async (resolve, reject): Promise<void> => {
            p.report({ message: `Generating Dependency Tree: ${name}` });
            try {
                const rawData: string | undefined = await rawDependencyTree(pomPath);
                resolve(rawData);
                return;
            } catch (error) {
                setUserError(<Error>error);
                reject(error);
                return;
            }
        }
    ));
}
