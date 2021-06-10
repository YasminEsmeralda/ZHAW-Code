<script>
	// TODO: Add properties for all input elements to the object "task". Initialise
	// the properties as empty string
	let task = {
		title: "",
		description: "",
		duedate: "",
	};

	// TODO: Show all properties of the object "task" in an alert
	// Hint: You can create a line break (new line) with "\n", e.g. alert("First line\nSecond line")
	function showTaskDetails() {
		alert(
			"Task title: " +
				task.title +
				"\nDetails: " +
				task.description +
				"\nDue Date: " +
				task.duedate
		);
	}
</script>

<form>
	<!-- TODO: Bind the values of the input fields to the corresponding properties in the object "task" -->

	<label for="task-title">Task title</label>
	<input id="task-title" type="text" bind:value={task.title} />

	<label for="task-description">Description</label>
	<textarea id="task-description" bind:value={task.description} />

	<label for="task-duedate">Due date</label>
	<input id="task-duedate" type="date" bind:value={task.duedate} />

	<!-- TODO: call the function "showTaskDetails" when the button is clicked -->
	<button type="button" on:click={showTaskDetails}>Submit</button>
</form>
