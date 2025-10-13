import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { NextResponse } from 'next/server';
import { config } from '../../../config/keys';

// Create DynamoDB client
const client = new DynamoDBClient({
  region: config.dynamodb.region,
});

const docClient = DynamoDBDocumentClient.from(client);

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: string;
  calories: number;
}

export async function GET() {
  try {
    console.log('🍽️ Fetching menu items from DynamoDB...');
    
    // Scan the entire table to get all menu items
    const command = new ScanCommand({
      TableName: config.dynamodb.tableName,
    });

    const result = await docClient.send(command);
    
    if (!result.Items) {
      console.log('⚠️ No items found in DynamoDB table');
      return NextResponse.json({ items: [] });
    }

    // Transform DynamoDB items to match our MenuItem interface
    const menuItems: MenuItem[] = result.Items.map((item: any) => ({
      id: Number(item.id), // Convert string id from DynamoDB to number
      name: item.name || '',
      description: item.description || '',
      price: Number(item.price) || 0,
      image: item.image || '',
      category: item.category || 'classic',
      quantity: item.quantity || '1 lb',
      calories: Number(item.calories) || 0
    }));

    // Sort by id to maintain consistent order
    menuItems.sort((a, b) => a.id - b.id);

    console.log(`✅ Successfully fetched ${menuItems.length} menu items from DynamoDB`);
    
    return NextResponse.json({ 
      items: menuItems,
      count: menuItems.length 
    });

  } catch (error) {
    console.error('❌ Error fetching menu items from DynamoDB:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch menu items',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
