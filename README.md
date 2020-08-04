# java-autocomplete

## Intro

For this project I decided to focus on the two parts of code completion programs that I find myself using the most: method suggestions and constructor parameter options.

## Installation and Examples

From the root directory:

```sh
npm install
npm start <path-to-file> <index>
```

### Custom Method Suggestion

![Example One](images/ExampleOne.png)

```sh
npm start examples/ExampleOne.java 223
```

Output:

```sh
----------------------------------------------------------------------------------------------------
someMethod( )                                       | return type:  int
getClass( )                                         | return type:  Class
hashCode( )                                         | return type:  int
equals( Object obj )                                | return type:  boolean
toString( )                                         | return type:  String
notify( )                                           | return type:
notifyAll( )                                        | return type:
wait( )                                             | return type:  InterruptedException
wait( long timeoutMillis )                          | return type:  long
wait( long timeoutMillis , int nanos )              | return type:  long
----------------------------------------------------------------------------------------------------
```

### Constructor Parameter Suggestions

![Example One](images/ExampleTwo.png)

```sh
npm start examples/ExampleTwo.java 237
```

Output:

```sh
----------------------------------------------------------------------------------------------------
String( )
String( String original )
String( StringBuffer buffer )
String( StringBuilder builder )
String( char value[] )
String( char value[] , int offset , int count )
String( char[] value , int off , int len , Void sig )
String( int[] codePoints , int offset , int count )
String( byte ascii[] , int hibyte , int offset , int count )
String( byte ascii[] , int hibyte )
String( byte bytes[] , int offset , int length , String charsetName )
String( byte bytes[] , int offset , int length , Charset charset )
String( byte bytes[] , int offset , int length )
String( byte bytes[] , String charsetName )
String( byte bytes[] , Charset charset )
String( byte[] bytes )
String( byte[] value , byte coder )
String( AbstractStringBuilder asb , Void sig )
----------------------------------------------------------------------------------------------------
```

### Partial Method Suggestions

![Example Three](images/ExampleThree.png)

```sh
npm start examples/ExampleThree.java 258
```

Output:

```sh
substring( int beginIndex )                         | return type:  int
substring( int beginIndex , int endIndex )          | return type:  int
subSequence( int beginIndex , int endIndex )        | return type:  int
```

## Process
