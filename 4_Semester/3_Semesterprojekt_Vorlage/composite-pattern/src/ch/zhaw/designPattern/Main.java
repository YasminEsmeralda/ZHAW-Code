package ch.zhaw.designPattern;

public class Main {

	public static void main(String[] args) {
		System.out.println("> Hello Yasmin :-)");
		
		Folder christmas2020 = new Folder("christmas2020");
		File picutre1 = new File("pictre1.jpg", "asdfasdf123");
		File picutre2 = new File("pictre2.jpg", "asdfasdf456");
		christmas2020.addChild(picutre1);
		christmas2020.addChild(picutre2);
		
		Folder pictures = new Folder("pictures");
		pictures.addChild(christmas2020);
		
		File theOrder = new File("theOrder.mp4", "siraugher");
		Folder films = new Folder("films");
		films.addChild(theOrder);
		
		Folder data = new Folder("data");
		data.addChild(pictures);
		data.addChild(films);
		
		System.out.println(data);
	}

}
