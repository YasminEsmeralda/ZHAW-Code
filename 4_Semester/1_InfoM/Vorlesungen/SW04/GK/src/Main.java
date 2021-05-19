
public class Main {

	public static void main(String[] args) {
		Folder root = new Folder("Root");
		Folder subFolder = new Folder("SubFolder");

		root.addChild(subFolder);
		File file = new File("myCV", "This is the content!");
		root.addChild(file);

		File file1 = new File("Source.xml", "hihihi XML");
		File file2 = new File("Todo.xml", "todo Liste in XML");
		root.addChild(file1);
		root.addChild(file2);

		System.out.println(root);

	}

}
