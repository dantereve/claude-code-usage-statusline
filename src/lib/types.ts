export interface HookInput {
	session_id: string;
	transcript_path: string;
	cwd: string;
	model: {
		id: string;
		display_name: string;
	};
	workspace: {
		current_dir: string;
		project_dir: string;
	};
	version: string;
	output_style: {
		name: string;
	};
	exceeds_200k_tokens?: boolean;
}
